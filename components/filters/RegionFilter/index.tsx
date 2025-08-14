import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleRegion } from '@/store/slices/filtersSlice';
import { Region } from '@/types';

interface RegionFilterProps {
  regions: Region[];
}

export const RegionFilter: React.FC<RegionFilterProps> = ({ regions }) => {
  const dispatch = useAppDispatch();
  const selectedRegions = useAppSelector(state => state.filters.regions);

  const handleToggle = (regionId: number) => {
    dispatch(toggleRegion(regionId));
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Регионы</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {regions.map(region => (
          <label
            key={region.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedRegions.includes(region.id)}
              onChange={() => handleToggle(region.id)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{region.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};