import { useEffect, useRef, useState, useCallback } from 'react';

interface SSEMessage {
  type: 'update' | 'error' | 'heartbeat';
  buses?: any[];
  timestamp?: string;
  networkType?: string;
  message?: string;
}

/**
 * Hook për Server-Sent Events (SSE)
 * Përdoret për real-time updates në vend të polling
 */
export function useSSE<T>(
  url: string | null,
  onMessage: (data: T) => void,
  options?: {
    enabled?: boolean;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Use refs për të ruajtur callbacks dhe options në mënyrë që të mos shkaktojnë re-rendering
  const onMessageRef = useRef(onMessage);
  const optionsRef = useRef(options);

  // Update refs kur ndryshojnë
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const connect = useCallback(() => {
    const currentOptions = optionsRef.current;
    const currentUrl = url;
    
    if (!currentUrl || (currentOptions?.enabled === false)) {
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(currentUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        currentOptions?.onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          
          if (data.type === 'heartbeat') {
            // Ignore heartbeat messages
            return;
          }

          if (data.type === 'error') {
            const error = new Error(data.message || 'SSE error');
            setError(error);
            currentOptions?.onError?.(error);
            return;
          }

          // Call the message handler using ref
          onMessageRef.current(data as T);
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (event) => {
        // Check if connection is already closed
        if (eventSource.readyState === EventSource.CLOSED) {
          setIsConnected(false);
          
          // Attempt to reconnect only if not manually closed
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            const error = new Error('SSE connection failed after multiple attempts');
            setError(error);
            currentOptions?.onError?.(error);
          }
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create SSE connection');
      setError(error);
      currentOptions?.onError?.(error);
    }
  }, [url]); // Vetëm url në dependencies

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
    optionsRef.current?.onDisconnect?.();
  }, []); // Pa dependencies - përdor ref

  useEffect(() => {
    // Check if enabled before connecting
    if (options?.enabled === false) {
      disconnect();
      return;
    }

    if (!url) {
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [url, options?.enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
  };
}

