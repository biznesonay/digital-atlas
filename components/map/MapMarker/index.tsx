import React, { useEffect, useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { InfrastructureObject } from '@/types';
import { createMarkerIcon } from '@/utils/markerUtils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectObject } from '@/store/slices/objectsSlice';
import { setHoveredObject } from '@/store/slices/mapSlice';

interface MapMarkerProps {
  object: InfrastructureObject;
  onClick?: () => void;
}

export const MapMarker: React.FC<MapMarkerProps> = ({ object, onClick }) => {
  const dispatch = useAppDispatch();
  const hoveredObjectId = useAppSelector(state => state.map.hoveredObjectId);
  const selectedObjectId = useAppSelector(state => state.objects.selectedObject?.id);
  const [showInfoWindow, setShowInfoWindow] = useState(false);

  // Определяем состояние маркера
  const markerState = 
    selectedObjectId === object.id ? 'selected' :
    hoveredObjectId === object.id ? 'hover' : 
    'default';

  // Создаем иконку маркера
  const icon = createMarkerIcon(
    object.type.id,
    object.type.color,
    markerState
  );

  const handleClick = () => {
    dispatch(selectObject(object.id));
    setShowInfoWindow(true);
    onClick?.();
  };

  const handleMouseOver = () => {
    dispatch(setHoveredObject(object.id));
  };

  const handleMouseOut = () => {
    dispatch(setHoveredObject(null));
  };

  const handleInfoWindowClose = () => {
    setShowInfoWindow(false);
  };

  // Проверяем наличие координат
  if (!object.coordinates?.latitude || !object.coordinates?.longitude) {
    return null;
  }

  return (
    <>
      <Marker
        position={{
          lat: object.coordinates.latitude,
          lng: object.coordinates.longitude,
        }}
        icon={icon}
        onClick={handleClick}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      />
      
      {showInfoWindow && (
        <InfoWindow
          position={{
            lat: object.coordinates.latitude,
            lng: object.coordinates.longitude,
          }}
          onCloseClick={handleInfoWindowClose}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-bold text-lg mb-2">{object.name}</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Тип:</span> {object.type.name}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Адрес:</span> {object.address}
            </p>
            {object.priorityDirections.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-semibold mb-1">Направления:</p>
                <div className="flex flex-wrap gap-1">
                  {object.priorityDirections.slice(0, 3).map(dir => (
                    <span 
                      key={dir.id}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {dir.name}
                    </span>
                  ))}
                  {object.priorityDirections.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{object.priorityDirections.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            {object.website && (
              <a 
                href={object.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Веб-сайт →
              </a>
            )}
          </div>
        </InfoWindow>
      )}
    </>
  );
};