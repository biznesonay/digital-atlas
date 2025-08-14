import React, { useState } from 'react';
import { SearchBar } from '../SearchBar';
import { TypeFilter } from '../TypeFilter';
import { RegionFilter } from '../RegionFilter';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetFilters, togglePriorityDirection } from '@/store/slices/filtersSlice';
import { InfrastructureType, Region, PriorityDirection } from '@/types';

interface FilterPanelProps {
  infrastructureTypes: InfrastructureType[];
  regions: Region[];
  priorityDirections: PriorityDirection[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  infrastructureTypes,
  regions,
  priorityDirections,
}) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedDirections = useAppSelector(state => state.filters.priorityDirections);
  const filters = useAppSelector(state => state.filters);

  // Проверяем, есть ли активные фильтры
  const hasActiveFilters = 
    filters.search ||
    filters.infrastructureTypes.length > 0 ||
    filters.regions.length > 0 ||
    filters.priorityDirections.length > 0;

  const handleReset = () => {
    dispatch(resetFilters());
  };

  const handleToggleDirection = (directionId: number) => {
    dispatch(togglePriorityDirection(directionId));
  };

  return (
    <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg z-20 w-80">
      {/* Заголовок панели */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-gray-800">Фильтры</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            className={`transform transition-transform ${isExpanded ? '' : 'rotate-180'}`}
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

      {/* Содержимое панели */}
      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Поиск */}
          <SearchBar />

          {/* Типы инфраструктуры */}
          <TypeFilter types={infrastructureTypes} />

          {/* Регионы */}
          <RegionFilter regions={regions} />

          {/* Приоритетные направления */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Приоритетные направления</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {priorityDirections.map(direction => (
                <label
                  key={direction.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedDirections.includes(direction.id)}
                    onChange={() => handleToggleDirection(direction.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{direction.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Кнопка сброса */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
};