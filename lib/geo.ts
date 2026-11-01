/**
 * Calculate the distance between two geographic points using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lng1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lng2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate ETA in minutes based on distance and average speed
 * @param distanceKm Distance in kilometers
 * @param averageSpeedKmH Average speed in km/h (default: 27.5 km/h for city buses)
 * @returns ETA in minutes
 */
export function calculateEtaMinutes(
  distanceKm: number,
  averageSpeedKmH: number = 27.5
): number {
  if (distanceKm <= 0) return 0;
  return Math.round((distanceKm / averageSpeedKmH) * 60);
}

/**
 * Determine bus status based on delay minutes
 * @param delayMinutes Delay in minutes
 * @returns Bus status
 */
export function getStatusFromDelay(delayMinutes: number): 'on-time' | 'delayed' | 'traffic-jam' {
  if (delayMinutes <= 1) {
    return 'on-time';
  } else if (delayMinutes <= 5) {
    return 'delayed';
  } else {
    return 'traffic-jam';
  }
}
