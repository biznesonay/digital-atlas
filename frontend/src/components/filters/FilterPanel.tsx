// frontend/src/components/filters/FilterPanel.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  setSearch, 
  setInfrastructureType, 
  setRegion, 
  setPriorityDirections,
  clearFilters 
} from '@/store/slices/filtersSlice';
import { fetchObjects } from '@/store/slices/objectsSlice';
import { dictionariesAPI } from '@/services/api';
import type { InfrastructureType, Region, PriorityDirection } from '@/types';

const FilterPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  
  const [infrastructureTypes, setInfrastructureTypes] = useState<InfrastructureType[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [priorityDirections, setPriorityDirectionsData] = useState<PriorityDirection[]>([]);
  const [searchValue, setSearchValue] = useState('');

  // Загрузка справочников
  useEffect(() => {
    const loadDictionaries = async () => {
      try {
        const [typesRes, regionsRes, directionsRes] = await Promise.all([
          dictionariesAPI.getInfrastructureTypes(),
          dictionariesAPI.getRegions(),
          dictionariesAPI.getPriorityDirections(),
        ]);

        if (typesRes.success) setInfrastructureTypes(typesRes.data);
        if (regionsRes.success) setRegions(regionsRes.data);
        if (directionsRes.success) setPriorityDirectionsData(directionsRes.data);
      } catch (error) {
        console.error('Error loading dictionaries:', error);
      }
    };

    loadDictionaries();
  }, []);

  // Применение фильтров
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchObjects({
        search: filters.search,
        infrastructureTypeId: filters.infrastructureTypeId || undefined,
        regionId: filters.regionId || undefined,
        priorityDirections: filters.priorityDirections.length > 0 ? filters.priorityDirections : undefined,
      }));
    }, 300); // Debounce для поиска

    return () => clearTimeout(timeoutId);
  }, [filters, dispatch]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    dispatch(setSearch(value));
  };

  const handleClearFilters = () => {
    setSearchValue('');
    dispatch(clearFilters());
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    (filters.infrastructureTypeId ? 1 : 0) +
    (filters.regionId ? 1 : 0) +
    (filters.priorityDirections.length > 0 ? 1 : 0);

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Поиск */}
        <TextField
          size="small"
          placeholder="Поиск по названию или адресу"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ flex: '1 1 300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Фильтр по типу инфраструктуры */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Тип объекта</InputLabel>
          <Select
            value={filters.infrastructureTypeId || ''}
            onChange={(e) => dispatch(setInfrastructureType(e.target.value ? Number(e.target.value) : null))}
            label="Тип объекта"
          >
            <MenuItem value="">Все типы</MenuItem>
            {infrastructureTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Фильтр по региону */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Регион</InputLabel>
          <Select
            value={filters.regionId || ''}
            onChange={(e) => dispatch(setRegion(e.target.value ? Number(e.target.value) : null))}
            label="Регион"
          >
            <MenuItem value="">Все регионы</MenuItem>
            {regions.map((region) => (
              <MenuItem key={region.id} value={region.id}>
                {region.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Фильтр по приоритетным направлениям */}
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel>Приоритетные направления</InputLabel>
          <Select
            multiple
            value={filters.priorityDirections}
            onChange={(e) => dispatch(setPriorityDirections(e.target.value as number[]))}
            input={<OutlinedInput label="Приоритетные направления" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const direction = priorityDirections.find(d => d.id === value);
                  return <Chip key={value} label={direction?.name} size="small" />;
                })}
              </Box>
            )}
          >
            {priorityDirections.map((direction) => (
              <MenuItem key={direction.id} value={direction.id}>
                {direction.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Кнопка сброса */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
          >
            Сбросить ({activeFiltersCount})
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FilterPanel;