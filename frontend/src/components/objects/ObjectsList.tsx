// frontend/src/components/objects/ObjectsList.tsx

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppSelector, useAppDispatch } from '@/store';
import { setSelectedObject } from '@/store/slices/uiSlice';
import type { MapObject } from '@/types';

interface ObjectsListProps {
  onObjectClick?: (object: MapObject) => void;
}

const ObjectsList: React.FC<ObjectsListProps> = ({ onObjectClick }) => {
  const dispatch = useAppDispatch();
  const objects = useAppSelector((state) => state.objects.items);
  const selectedObjectId = useAppSelector((state) => state.ui.selectedObjectId);

  const handleObjectClick = (object: MapObject) => {
    dispatch(setSelectedObject(object.id));
    if (onObjectClick) {
      onObjectClick(object);
    }
  };

  if (objects.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Объекты не найдены
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {objects.map((object, index) => (
        <React.Fragment key={object.id}>
          {index > 0 && <Divider />}
          <ListItem
            sx={{
              p: 0,
              '&:hover': { bgcolor: 'action.hover' },
              bgcolor: selectedObjectId === object.id ? 'action.selected' : 'transparent',
            }}
          >
            <Card
              elevation={0}
              sx={{
                width: '100%',
                cursor: 'pointer',
                bgcolor: 'transparent',
              }}
              onClick={() => handleObjectClick(object)}
            >
              <CardContent>
                {/* Тип инфраструктуры */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Chip
                    label={object.infrastructureType.name}
                    size="small"
                    sx={{
                      bgcolor: object.infrastructureType.color,
                      color: 'white',
                    }}
                  />
                  <IconButton size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleObjectClick(object);
                  }}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Название */}
                <Typography variant="h6" component="h3" gutterBottom>
                  {object.name}
                </Typography>

                {/* Адрес */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {object.address}
                  </Typography>
                </Box>

                {/* Регион */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {object.region.name}
                </Typography>

                {/* Телефон */}
                {object.phones.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {object.phones[0].number}
                    </Typography>
                  </Box>
                )}

                {/* Веб-сайт */}
                {object.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LanguageIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="primary">
                      {object.website}
                    </Typography>
                  </Box>
                )}

                {/* Приоритетные направления */}
                {object.priorityDirections.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {object.priorityDirections.slice(0, 3).map((direction) => (
                      <Chip
                        key={direction.id}
                        label={direction.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {object.priorityDirections.length > 3 && (
                      <Chip
                        label={`+${object.priorityDirections.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};

export default ObjectsList;