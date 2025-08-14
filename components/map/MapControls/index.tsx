import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setZoom, toggleMapType } from '@/store/slices/mapSlice';

interface MapControlsProps {
  map?: google.maps.Map;
}

export const MapControls: React.FC<MapControlsProps> = ({ map }) => {
  const dispatch = useAppDispatch();
  const { zoom, mapType } = useAppSelector(state => state.map);

  const handleZoomIn = () => {
    if (map) {
      const newZoom = Math.min(zoom + 1, 20);
      map.setZoom(newZoom);
      dispatch(setZoom(newZoom));
    }
  };

  const handleZoomOut = () => {
    if (map) {
      const newZoom = Math.max(zoom - 1, 5);
      map.setZoom(newZoom);
      dispatch(setZoom(newZoom));
    }
  };

  const handleToggleMapType = () => {
    if (map) {
      const newType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
      map.setMapTypeId(newType);
      dispatch(toggleMapType());
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {/* Контролы зума */}
      <div className="bg-white rounded-lg shadow-md flex flex-col">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 transition-colors rounded-t-lg"
          title="Приблизить"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="border-t border-gray-200"></div>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 transition-colors rounded-b-lg"
          title="Отдалить"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Переключатель типа карты */}
      <button
        onClick={handleToggleMapType}
        className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-100 transition-colors"
        title={mapType === 'roadmap' ? 'Спутник' : 'Карта'}
      >
        {mapType === 'roadmap' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 7h16M7 2v16" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2l7 4v8l-7 4-7-4V6l7-4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M10 18V10M3 6l7 4 7-4" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        )}
      </button>
    </div>
  );
};