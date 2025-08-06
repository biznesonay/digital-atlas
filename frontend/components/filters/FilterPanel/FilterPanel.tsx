'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  TextField,
  Autocomplete,
  Button,
  Chip,
  Box,
  Stack,
  Typography,
  IconButton,
  Collapse,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setSearch,
  setInfrastructureTypes,
  setPriorityDirections,
  setRegion,
  resetFilters,
  selectFilters,
  selectActiveFiltersCount,
} from '@/store/slices/filtersSlice';
import {
  selectInfrastructureTypes,
  selectRegions,
  selectPriorityDirections,
} from '@/store/slices/referencesSlice';
import { fetchObjects } from '@/store/slices/objectsSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function FilterPanel() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const filters = useAppSelector(selectFilters);
  const activeFiltersCount = useAppSelector(selectActiveFiltersCount);
  const language = useAppSelector(selectLanguage);
  const infrastructureTypes = useAppSelector(selectInfrastructureTypes);
  const regions = useAppSelector(selectRegions);
  const priorityDirections = useAppSelector(selectPriorityDirections);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  
  const debouncedSearch = useDebounce(localSearch, 300);

  // Обновляем поиск с debounce
  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  // Применяем фильтры
  useEffect(() => {
    dispatch(fetchObjects({ filters, lang: language }));
  }, [filters, language, dispatch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleInfrastructureTypesChange = (_: any, values: any[]) => {
    dispatch(setInfrastructureTypes(values.map(v => v.id)));
  };

  const handlePriorityDirectionsChange = (_: any, values: any[]) => {
    dispatch(setPriorityDirections(values.map(v => v.id)));
  };

  const handleRegionChange = (_: any, value: any) => {
    dispatch(setRegion(value?.id));
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    dispatch(resetFilters());
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 80,
        left: 16,
        right: { xs: 16, md: 'auto' },
        width: { xs: 'auto', md: 400 },
        p: 2,
        zIndex: 1000,
        maxHeight: 'calc(100vh - 100px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('filters.title', 'Фильтры')}
        </Typography>
        {activeFiltersCount > 0 && (
          <Badge badgeContent={activeFiltersCount} color="primary" sx={{ mr: 2 }}>
            <div />
          </Badge>
        )}
        <IconButton size="small" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Stack spacing={2} sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {/* Поиск */}
          <TextField
            fullWidth
            size="small"
            placeholder={t('filters.search_placeholder')}
            value={localSearch}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: localSearch && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setLocalSearch('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Тип инфраструктуры */}
          <Autocomplete
            multiple
            size="small"
            options={infrastructureTypes}
            getOptionLabel={(option) => option.name}
            value={infrastructureTypes.filter(type => 
              filters.infrastructureTypeIds?.includes(type.id)
            )}
            onChange={handleInfrastructureTypesChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('filters.infrastructure_type')}
                placeholder={t('filters.all_types')}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  size="small"
                  label={option.name}
                  {...getTagProps({ index })}
                  sx={{ backgroundColor: option.color, color: 'white' }}
                />
              ))
            }
          />

          {/* Приоритетные направления */}
          <Autocomplete
            multiple
            size="small"
            options={priorityDirections}
            getOptionLabel={(option) => option.name}
            value={priorityDirections.filter(dir => 
              filters.priorityDirectionIds?.includes(dir.id)
            )}
            onChange={handlePriorityDirectionsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('filters.priority_directions')}
                placeholder={t('filters.all_directions')}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  size="small"
                  label={option.name}
                  {...getTagProps({ index })}
                />
              ))
            }
            sx={{
              '& .MuiAutocomplete-tag': {
                maxWidth: '150px',
                '& .MuiChip-label': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              },
            }}
          />

          {/* Регион */}
          <Autocomplete
            size="small"
            options={regions}
            getOptionLabel={(option) => option.name}
            value={regions.find(r => r.id === filters.regionId) || null}
            onChange={handleRegionChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('filters.region')}
                placeholder={t('filters.all_regions')}
              />
            )}
          />

          {/* Кнопка сброса */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleResetFilters}
              fullWidth
            >
              {t('filters.reset_filters')}
            </Button>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}
