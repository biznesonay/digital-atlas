import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { InfrastructureType } from '@/types';

interface MapLegendProps {
  infrastructureTypes: InfrastructureType[];
  objectCounts: Record<number, number>;
  onToggleType?: (typeId: number) => void;
  visibleTypes?: number[];
}

export const MapLegend: React.FC<MapLegendProps> = ({
  infrastructureTypes,
  objectCounts,
  onToggleType,
  visibleTypes = [],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    // На мобильных устройствах легенда свернута по умолчанию
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div 
      className={`
        absolute bg-white rounded-lg shadow-lg transition-all
        ${isMobile ? 'bottom-20 left-4 right-4' : 'top-20 left-4 max-w-xs'}
      `}
    >
      {/* Заголовок легенды */}
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="font-semibold text-gray-800">Легенда</h3>
        <button className="text-gray-500 hover:text-gray-700">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            className={`transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <path 
              d="M5 7l5 5 5-5" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none"
            />
          </svg>
        </button>
      </div>

      {/* Список типов */}
      {!isCollapsed && (
        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
          {infrastructureTypes.map(type => {
            const count = objectCounts[type.id] || 0;
            const isVisible = visibleTypes.length === 0 || visibleTypes.includes(type.id);
            
            return (
              <div 
                key={type.id}
                className={`
                  flex items-center justify-between p-2 rounded cursor-pointer
                  transition-all hover:bg-gray-50
                  ${!isVisible ? 'opacity-50' : ''}
                `}
                onClick={() => onToggleType?.(type.id)}
              >
                <div className="flex items-center gap-2">
                  {/* Цветовой индикатор */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: type.color }}
                  />
                  {/* Название типа */}
                  <span className="text-sm font-medium text-gray-700">
                    {type.name}
                  </span>
                </div>
                {/* Счетчик объектов */}
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {count}
                </span>
              </div>
            );
          })}
          
          {infrastructureTypes.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Нет доступных типов
            </p>
          )}
        </div>
      )}
    </div>
  );
};