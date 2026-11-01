import { useRef } from 'react';

/**
 * Hook për request deduplication
 * Parandalon request-e të dyfishta për të njëjtin resource
 */
export function useRequestDeduplication() {
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const deduplicatedFetch = async <T,>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    // Nëse ka një request në proces për këtë key, kthe promise ekzistues
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key)!;
    }

    // Krijon një request të ri
    const promise = fetchFn()
      .then((result) => {
        // Fshij nga pending requests pasi të përfundojë
        pendingRequests.current.delete(key);
        return result;
      })
      .catch((error) => {
        // Fshij edhe në rast error
        pendingRequests.current.delete(key);
        throw error;
      });

    // Ruaj në pending requests
    pendingRequests.current.set(key, promise);

    return promise;
  };

  const clearPending = (key?: string) => {
    if (key) {
      pendingRequests.current.delete(key);
    } else {
      pendingRequests.current.clear();
    }
  };

  return { deduplicatedFetch, clearPending };
}

