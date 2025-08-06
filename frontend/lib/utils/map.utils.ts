import { DigitalObject, InfrastructureType, MapMarker } from '@/types';

// Конфигурация карты
export const mapConfig = {
  defaultCenter: { lat: 48.0196, lng: 66.9237 }, // Центр Казахстана
  defaultZoom: 6,
  minZoom: 4,
  maxZoom: 18,
  clusteringMinZoom: 10,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

// Опции для карты
export const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  styles: mapConfig.styles,
};

// Создание маркера из объекта
export function createMarkerFromObject(object: DigitalObject): MapMarker | null {
  if (!object.latitude || !object.longitude) {
    return null;
  }

  return {
    id: object.id,
    position: {
      lat: object.latitude,
      lng: object.longitude,
    },
    type: object.infrastructureType,
    title: object.name || '',
    object,
  };
}

// Создание иконки для маркера
export function createMarkerIcon(type: InfrastructureType): google.maps.Icon {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: type.color,
    fillOpacity: 0.9,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: 12,
  };
}

// Создание расширенной иконки с Material icon
export function createCustomMarkerIcon(type: InfrastructureType): string {
  const svg = `
    <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M20 0C8.95 0 0 8.95 0 20C0 35 20 48 20 48S40 35 40 20C40 8.95 31.05 0 20 0Z" 
            fill="${type.color}" filter="url(#shadow)"/>
      <circle cx="20" cy="20" r="16" fill="white" opacity="0.9"/>
      <text x="20" y="20" text-anchor="middle" dominant-baseline="central" 
            font-family="Material Icons" font-size="18" fill="${type.color}">
        ${type.icon}
      </text>
    </svg>
  `;
  
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Подстройка границ карты под маркеры
export function fitMapToBounds(
  map: google.maps.Map,
  markers: MapMarker[],
  padding = 50
): void {
  if (markers.length === 0) return;

  const bounds = new google.maps.LatLngBounds();
  
  markers.forEach(marker => {
    bounds.extend(new google.maps.LatLng(marker.position.lat, marker.position.lng));
  });

  map.fitBounds(bounds, padding);
}

// Кластеризация маркеров
export function shouldClusterMarkers(zoom: number): boolean {
  return zoom < mapConfig.clusteringMinZoom;
}

// Расчет центра для группы маркеров
export function calculateCenter(markers: MapMarker[]): google.maps.LatLng | null {
  if (markers.length === 0) return null;

  let totalLat = 0;
  let totalLng = 0;

  markers.forEach(marker => {
    totalLat += marker.position.lat;
    totalLng += marker.position.lng;
  });

  return new google.maps.LatLng(
    totalLat / markers.length,
    totalLng / markers.length
  );
}

// Открытие объекта в Google Maps
export function openInGoogleMaps(object: DigitalObject): void {
  if (object.googleMapsUrl) {
    window.open(object.googleMapsUrl, '_blank');
  } else if (object.latitude && object.longitude) {
    const url = `https://www.google.com/maps/search/?api=1&query=${object.latitude},${object.longitude}`;
    window.open(url, '_blank');
  }
}

// Построение маршрута в Google Maps
export function buildRoute(object: DigitalObject): void {
  if (object.latitude && object.longitude) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${object.latitude},${object.longitude}`;
    window.open(url, '_blank');
  }
}
