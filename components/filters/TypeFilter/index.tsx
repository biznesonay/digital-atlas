import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleInfrastructureType } from '@/store/slices/filtersSlice';
import { InfrastructureType } from '@/types';

interface TypeFilterProps {
  types: InfrastructureType[];
}

export const TypeFilter: React.FC<TypeFilterProps> = ({ types }) => {
  const dispatch = useAppDispatch();
  const selectedTypes = useAppSelector(state => state.filters.infrastructureTypes);

  const handleToggle = (typeId: number) => {
    dispatch(toggleInfrastructureType(typeId));
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Тип инфраструктуры</h3>
      <div className="space-y-2">
        {types.map(type => (
          <label
            key={type.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedTypes.includes(type.id)}
              onChange={() => handleToggle(type.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 flex-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm text-gray-700">{type.name}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};