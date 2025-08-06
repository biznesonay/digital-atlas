'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  MarkerClusterer,
} from '@react-google-maps/api';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectAllObjects, selectSelectedObject, selectObject } from '@/store/slices/objectsSlice';
import { selectMapView, setMapView } from '@/store/slices/uiSlice';
import { createMarkerFromObject, createCustomMarkerIcon, mapConfig, mapOptions } from '@/lib/utils/map.utils';
import ObjectInfoWindow from '../ObjectInfoWindow';

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

export default function InteractiveMap() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const objects = useAppSelector(selectAllObjects);
  const selectedObject = useAppSelector(selectSelectedObject);
  const mapView = useAppSelector(selectMapView);
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  const mapRef = useRef<google.maps.Map | null>(null);

  // Создание маркеров из объектов
  const markers = objects
    .map(createMarkerFromObject)
    .filter((marker): marker is NonNullable<typeof marker> => marker !== null);

  // Обработчик загрузки карты
  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
    setIsLoaded(true);
  }, []);

  // Обработчик размонтирования карты
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  // Обработчик клика на маркер
  const handleMarkerClick = (markerId: number) => {
    const object = objects.find(obj => obj.id === markerId);
    if (object) {
      dispatch(selectObject(object));
      setSelectedMarkerId(markerId);
    }
  };

  // Обработчик двойного клика на маркер
  const handleMarkerDoubleClick = (marker: any) => {
    if (map) {
      map.setZoom(16);
      map.panTo(marker.position);
    }
  };

  // Обработчик закрытия InfoWindow
  const handleInfoWindowClose = () => {
    setSelectedMarkerId(null);
    dispatch(selectObject(null));
  };

  // Обработчик изменения карты
  const handleMapChange = () => {
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      if (center && zoom !== undefined) {
        dispatch(setMapView({
          center: { lat: center.lat(), lng: center.lng() },
          zoom,
        }));
      }
    }
  };

  // Центрирование на выбранном объекте
  useEffect(() => {
    if (map && selectedObject && selectedObject.latitude && selectedObject.longitude) {
      map.panTo({ lat: selectedObject.latitude, lng: selectedObject.longitude });
      map.setZoom(16);
      setSelectedMarkerId(selectedObject.id);
    }
  }, [map, selectedObject]);

  // Обработчик ошибки загрузки
  const handleLoadError = (error: Error) => {
    console.error('Error loading Google Maps:', error);
    setLoadError(error);
  };

  if (loadError) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {t('map.error')}
          <br />
          {loadError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}
      libraries={libraries}
      language={i18n.language}
      onError={handleLoadError}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
        {!isLoaded && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
        
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapView.center}
          zoom={mapView.zoom}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onZoomChanged={handleMapChange}
          onCenterChanged={handleMapChange}
        >
          {isLoaded && (
            <MarkerClusterer
              options={{
                imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                maxZoom: mapConfig.clusteringMinZoom - 1,
                minimumClusterSize: 5,
                styles: [
                  {
                    textColor: 'white',
                    url: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2250%22%20height%3D%2250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2225%22%20cy%3D%2225%22%20r%3D%2220%22%20fill%3D%22%231976D2%22%20opacity%3D%220.8%22%2F%3E%3C%2Fsvg%3E',
                    height: 50,
                    width: 50,
                  },
                ],
              }}
            >
              {(clusterer) => (
                <>
                  {markers.map((marker) => (
                    <Marker
                      key={marker.id}
                      position={marker.position}
                      clusterer={clusterer}
                      icon={{
                        url: createCustomMarkerIcon(marker.type),
                        scaledSize: new google.maps.Size(40, 48),
                        anchor: new google.maps.Point(20, 48),
                      }}
                      title={marker.title}
                      onClick={() => handleMarkerClick(marker.id)}
                      onDblClick={() => handleMarkerDoubleClick(marker)}
                      animation={
                        selectedMarkerId === marker.id
                          ? google.maps.Animation.BOUNCE
                          : undefined
                      }
                    />
                  ))}
                </>
              )}
            </MarkerClusterer>
          )}

          {selectedMarkerId && selectedObject && (
            <InfoWindow
              position={{
                lat: selectedObject.latitude!,
                lng: selectedObject.longitude!,
              }}
              onCloseClick={handleInfoWindowClose}
              options={{
                pixelOffset: new google.maps.Size(0, -48),
                maxWidth: 400,
              }}
            >
              <ObjectInfoWindow object={selectedObject} />
            </InfoWindow>
          )}
        </GoogleMap>
      </Box>
    </LoadScript>
  );
}
