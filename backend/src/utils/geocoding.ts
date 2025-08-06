import { config } from '../config/app.config';

export interface Coordinates {
  lat: number;
  lng: number;
}

export class GeocodingUtil {
  // Извлечение координат из Google Maps URL
  static extractCoordinatesFromUrl(url: string): Coordinates | null {
    if (!url) return null;

    try {
      // Паттерны для разных форматов Google Maps URLs
      const patterns = [
        // https://www.google.com/maps/place/.../@43.238949,76.889709,17z
        /@(-?\d+\.\d+),(-?\d+\.\d+),/,
        // https://maps.google.com/?q=43.238949,76.889709
        /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
        // https://goo.gl/maps/... (нужно сначала разрешить короткую ссылку)
        /maps\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting coordinates from URL:', error);
      return null;
    }
  }

  // Геокодирование адреса (заглушка - в реальном проекте использовать Google Geocoding API)
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (!address || !config.googleGeocodingApiKey) {
      return null;
    }

    try {
      // TODO: Реализовать вызов Google Geocoding API
      // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.googleGeocodingApiKey}`);
      
      console.log('Geocoding address:', address);
      
      // Временная заглушка - возвращаем null
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Валидация координат
  static validateCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180
    );
  }

  // Расчет расстояния между двумя точками (формула гаверсинуса)
  static calculateDistance(
    coord1: Coordinates,
    coord2: Coordinates
  ): number {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLon = this.toRad(coord2.lng - coord1.lng);
    const lat1 = this.toRad(coord1.lat);
    const lat2 = this.toRad(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private static toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
