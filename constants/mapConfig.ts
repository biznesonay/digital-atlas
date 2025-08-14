export const MAP_CONFIG = {
  defaultCenter: {
    lat: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT || '43.238949'),
    lng: parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG || '76.889709'),
  },
  defaultZoom: parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || '12'),
  minZoom: 5,
  maxZoom: 20,
  clusteringZoom: 10,
  
  // Опции карты Google
  mapOptions: {
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    clickableIcons: false,
  },
  
  // Стили карты (опционально)
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};