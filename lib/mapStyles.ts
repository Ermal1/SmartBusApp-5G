/**
 * Clean, light, pastel city map style for bus tracking
 * Similar to Snazzy Maps "light / pastel city" style
 * Soft gray roads, light background, very subtle POIs, no strong colors
 */
export const cleanMapStyle: google.maps.MapTypeStyle[] = [
  // Hide most POIs
  {
    featureType: 'poi',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  // Soft gray roads - very light and subtle
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      { color: '#f0f0f0' },
      { saturation: -100 },
      { lightness: 100 },
      { gamma: 0.9 },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      { color: '#e8e8e8' },
      { saturation: -100 },
      { lightness: 95 },
    ],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [
      { color: '#f5f5f5' },
      { saturation: -100 },
      { lightness: 100 },
    ],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [
      { color: '#fafafa' },
      { saturation: -100 },
      { lightness: 100 },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#999999' }, { lightness: 40 }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { lightness: 100 }],
  },
  // Very light, neutral water
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      { color: '#e8e8e8' },
      { lightness: 60 },
      { saturation: -80 },
    ],
  },
  // Light, neutral land/background
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      { color: '#fafafa' },
      { lightness: 50 },
      { saturation: -50 },
    ],
  },
  // Hide transit
  {
    featureType: 'transit',
    elementType: 'all',
    stylers: [{ visibility: 'off' }],
  },
  // Subtle administrative labels
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#999999' }, { lightness: 30 }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }, { weight: 2 }],
  },
  // Very subtle parks (no strong green) - use poi.park instead of park
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      { color: '#f0f0f0' },
      { saturation: -100 },
      { lightness: 50 },
    ],
  },
  // Light building colors - use landscape.man_made for buildings
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [
      { color: '#f5f5f5' },
      { saturation: -100 },
      { lightness: 50 },
    ],
  },
];

// Keep the old export for backward compatibility
export const lightBusMapStyle = cleanMapStyle;
