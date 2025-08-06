'use client';

import { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close,
  Search,
  ViewList,
  ViewModule,
  LocationOn,
  Business,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectAllObjects,
  selectObjectsLoading,
  selectObjectsError,
  selectObjectsMeta,
  selectObject,
} from '@/store/slices/objectsSlice';
import { setObjectsListOpen } from '@/store/slices/uiSlice';
import { DigitalObject } from '@/types';
import ObjectCard from '../ObjectCard';

interface ObjectsListModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ObjectsListModal({ open, onClose }: ObjectsListModalProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const objects = useAppSelector(selectAllObjects);
  const loading = useAppSelector(selectObjectsLoading);
  const error = useAppSelector(selectObjectsError);
  const meta = useAppSelector(selectObjectsMeta);
  
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [localSearch, setLocalSearch] = useState('');

  // Фильтрация объектов по локальному поиску
  const filteredObjects = objects.filter(obj => {
    if (!localSearch) return true;
    const searchLower = localSearch.toLowerCase();
    return (
      obj.name?.toLowerCase().includes(searchLower) ||
      obj.address?.toLowerCase().includes(searchLower) ||
      obj.infrastructureType.name.toLowerCase().includes(searchLower)
    );
  });

  const handleObjectClick = (object: DigitalObject) => {
    dispatch(selectObject(object));
    onClose();
  };

  const handleClose = () => {
    dispatch(setObjectsListOpen(false));
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 480 },
          maxWidth: '100%',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {t('map.objects_list')}
          {meta && (
            <Badge
              badgeContent={meta.total}
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <IconButton onClick={handleClose} edge="end">
          <Close />
        </IconButton>
      </Box>

      {/* Поиск и вид */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('common.search')}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="cards">
                <ViewModule />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Box>

      {/* Контент */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredObjects.length === 0 && (
          <Alert severity="info" sx={{ m: 2 }}>
            {t('common.no_results', 'Объекты не найдены')}
          </Alert>
        )}

        {!loading && !error && filteredObjects.length > 0 && (
          <>
            {viewMode === 'list' ? (
              <List sx={{ p: 0 }}>
                {filteredObjects.map((object, index) => (
                  <div key={object.id}>
                    {index > 0 && <Divider />}
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleObjectClick(object)}>
                        <ListItemIcon>
                          <Business
                            sx={{ color: object.infrastructureType.color }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={object.name}
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                                {object.address}
                              </Typography>
                              <Box>
                                <Chip
                                  label={object.infrastructureType.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: object.infrastructureType.color,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    height: 20,
                                  }}
                                />
                              </Box>
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </div>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Stack spacing={2}>
                  {filteredObjects.map((object) => (
                    <ObjectCard
                      key={object.id}
                      object={object}
                      onClick={() => handleObjectClick(object)}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Box>
    </Drawer>
  );
}
