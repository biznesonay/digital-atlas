import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { GoogleMap, LoadScript, MarkerClusterer } from '@react-google-maps/api';
import { MapMarker } from '../MapMarker';
import { MapControls } from '../MapControls';
import { MapLegend } from '../MapLegend';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCenter, setZoom, setMapLoaded } from '@/store/slices/mapSlice';
import { MAP_CONFIG } from '@/constants/mapConfig';
import { createClusterIcon } from '@/utils/markerUtils';
import { InfrastructureType } from '@/types';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

interface MapContainerProps {
  infrastructureTypes: InfrastructureType[];
}

export const MapContainer: React.FC<MapContainerProps> = ({ infrastructureTypes }) => {
  const dispatch = useAppDispatch();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<number[]>([]);
  
  const { center, zoom, mapType } = useAppSelector(state => state.map);
  const { items: objects } = useAppSelector(state => state.objects);
  const filters = useAppSelector(state => state.filters);

  // Фильтрация объектов
  const filteredObjects = useMemo(() => {
    let filtered = [...objects];

    // Фильтр по поиску
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(obj => 
        obj.name.toLowerCase().includes(searchLower) ||
        obj.address.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по типам инфраструктуры
    if (filters.infrastructureTypes.length > 0) {
      filtered = filtered.filter(obj => 
        filters.infrastructureTypes.includes(obj.type.id)
      );
    }

    // Фильтр по регионам
    if (filters.regions.length > 0) {
      filtered = filtered.filter(obj => 
        filters.regions.includes(obj.region.id)
      );
    }

    // Фильтр по приоритетным направлениям
    if (filters.priorityDirections.length > 0) {
      filtered = filtered.filter(obj => 
        obj.priorityDirections.some(dir => 
          filters.priorityDirections.includes(dir.id)
        )
      );
    }

    // Фильтр по видимым типам в легенде
    if (visibleTypes.length > 0) {
      filtered = filtered.filter(obj => 
        visibleTypes.includes(obj.type.id)
      );
    }

    return filtered;
  }, [objects, filters, visibleTypes]);

  // Подсчет объектов по типам
  const objectCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    filteredObjects.forEach(obj => {
      counts[obj.type.id] = (counts[obj.type.id] || 0) + 1;
    });
    return counts;
  }, [filteredObjects]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    dispatch(setMapLoaded(true));
  }, [dispatch]);

  const onUnmount = useCallback(() => {
    setMap(null);
    dispatch(setMapLoaded(false));
  }, [dispatch]);

  const handleCenterChanged = () => {
    if (!map) return;
    const newCenter = map.getCenter();
    if (newCenter) {
      dispatch(setCenter({
        lat: newCenter.lat(),
        lng: newCenter.lng(),
      }));
    }
  };

  const handleZoomChanged = () => {
    if (!map) return;
    const newZoom = map.getZoom();
    if (newZoom) {
      dispatch(setZoom(newZoom));
    }
  };

  const handleToggleType = (typeId: number) => {
    setVisibleTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  // Опции кластеризации
  const clusterOptions = {
    imagePath: '',
    gridSize: 60,
    maxZoom: MAP_CONFIG.clusteringZoom,
    minimumClusterSize: 2,
    styles: [{
      url: '',
      height: 40,
      width: 40,
      textColor: '#ffffff',
      textSize: 14,
    }],
    calculator: (markers: any[]) => {
      const count = markers.length;
      return {
        text: count.toString(),
        index: 1,
      };
    },
  };

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-2">Google Maps API ключ не настроен</p>
          <p className="text-sm text-gray-600">
            Добавьте NEXT_PUBLIC_GOOGLE_MAPS_API_KEY в файл .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      language="ru"
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={{
          ...MAP_CONFIG.mapOptions,
          mapTypeId: mapType,
        }}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onCenterChanged={handleCenterChanged}
        onZoomChanged={handleZoomChanged}
      >
        {/* Маркеры с кластеризацией */}
        <MarkerClusterer options={clusterOptions}>
          {(clusterer) => (
            <>
              {filteredObjects.map(object => (
                <MapMarker
                  key={object.id}
                  object={object}
                  clusterer={clusterer}
                />
              ))}
            </>
          )}
        </MarkerClusterer>

        {/* Контролы карты */}
        <MapControls map={map} />

        {/* Легенда */}
        <MapLegend
          infrastructureTypes={infrastructureTypes}
          objectCounts={objectCounts}
          onToggleType={handleToggleType}
          visibleTypes={visibleTypes}
        />
      </GoogleMap>
    </LoadScript>
  );
};