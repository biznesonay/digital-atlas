// frontend/src/components/map/InteractiveMap.tsx

'use client';

import React, { useState, useCallback, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '@/store';
import type { MapObject } from '@/types';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px',
};

const defaultCenter = {
  lat: 48.0196, // Центр Казахстана
  lng: 66.9237,
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

interface InteractiveMapProps {
  onMarkerClick?: (object: MapObject) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ onMarkerClick }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    language: 'ru',
    region: 'KZ',
  });

  const objects = useAppSelector((state) => state.objects.items);
  const mapCenter = useAppSelector((state) => state.ui.mapCenter);
  const mapZoom = useAppSelector((state) => state.ui.mapZoom);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Если есть объекты, автоматически подстраиваем границы
    if (objects.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      objects.forEach((obj) => {
        if (obj.latitude && obj.longitude) {
          bounds.extend({ lat: obj.latitude, lng: obj.longitude });
        }
      });
      map.fitBounds(bounds);
    }
  }, [objects]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (object: MapObject) => {
    setSelectedObject(object);
    if (onMarkerClick) {
      onMarkerClick(object);
    }
  };

  const getMarkerIcon = (infrastructureType: any) => {
    // Можно настроить разные иконки для разных типов
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: infrastructureType.color || '#1976D2',
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 12,
    };
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '600px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter || defaultCenter}
      zoom={mapZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      {objects.map((object) => {
        if (!object.latitude || !object.longitude) return null;
        
        return (
          <Marker
            key={object.id}
            position={{
              lat: object.latitude,
              lng: object.longitude,
            }}
            onClick={() => handleMarkerClick(object)}
            icon={getMarkerIcon(object.infrastructureType)}
            title={object.name}
          />
        );
      })}

      {selectedObject && (
        <InfoWindow
          position={{
            lat: selectedObject.latitude!,
            lng: selectedObject.longitude!,
          }}
          onCloseClick={() => setSelectedObject(null)}
        >
          <Box sx={{ p: 1, minWidth: 250 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  bgcolor: selectedObject.infrastructureType.color,
                  color: 'white',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}
              >
                {selectedObject.infrastructureType.name}
              </Box>
            </Box>
            <h3 style={{ margin: '8px 0' }}>{selectedObject.name}</h3>
            <p style={{ margin: '4px 0' }}>{selectedObject.address}</p>
            {selectedObject.phones.length > 0 && (
              <p style={{ margin: '4px 0' }}>
                Тел: {selectedObject.phones[0].number}
              </p>
            )}
          </Box>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default memo(InteractiveMap);