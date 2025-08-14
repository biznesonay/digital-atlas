import { MARKER_COLORS, MARKER_SIZES } from '@/constants/colors';

// Создание SVG иконки маркера
export const createMarkerIcon = (
  typeId: number,
  color: string,
  state: 'default' | 'hover' | 'selected' = 'default'
): google.maps.Icon => {
  const size = MARKER_SIZES[state];
  
  // SVG маркер без анимации
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
            fill="${color}" 
            stroke="#FFFFFF" 
            stroke-width="2"/>
      <circle cx="12" cy="9" r="3" fill="#FFFFFF" opacity="0.8"/>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(size / 2, size),
  };
};

// Создание иконки кластера
export const createClusterIcon = (count: number): google.maps.Icon => {
  const size = Math.min(40 + Math.floor(count / 10) * 5, 60);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}"
              fill="#6B7280" 
              stroke="#FFFFFF" 
              stroke-width="2"/>
      <text x="${size/2}" y="${size/2 + 5}"
            font-family="Arial" 
            font-size="14" 
            font-weight="bold"
            fill="white" 
            text-anchor="middle">${count}</text>
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
};