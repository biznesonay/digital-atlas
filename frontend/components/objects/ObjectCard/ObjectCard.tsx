'use client';

import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Language,
} from '@mui/icons-material';
import { DigitalObject } from '@/types';

interface ObjectCardProps {
  object: DigitalObject;
  onClick?: () => void;
}

export default function ObjectCard({ object, onClick }: ObjectCardProps) {
  return (
    <Card>
      <CardActionArea onClick={onClick}>
        <CardContent>
          {/* Тип инфраструктуры */}
          <Chip
            label={object.infrastructureType.name}
            size="small"
            sx={{
              backgroundColor: object.infrastructureType.color,
              color: 'white',
              mb: 1,
            }}
          />

          {/* Название */}
          <Typography variant="h6" component="h3" gutterBottom>
            {object.name}
          </Typography>

          {/* Информация */}
          <Stack spacing={1}>
            {/* Адрес */}
            {object.address && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1, mt: 0.25 }} />
                <Typography variant="body2" color="text.secondary">
                  {object.address}
                </Typography>
              </Box>
            )}

            {/* Телефон */}
            {object.phones.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {object.phones[0].number}
                  {object.phones.length > 1 && ` (+${object.phones.length - 1})`}
                </Typography>
              </Box>
            )}

            {/* Веб-сайт */}
            {object.website && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Language sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {object.website.replace(/^https?:\/\//, '')}
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Приоритетные направления */}
          {object.priorityDirections.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {object.priorityDirections.slice(0, 2).map((direction) => (
                  <Chip
                    key={direction.id}
                    label={direction.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      height: 24,
                      maxWidth: 150,
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    }}
                  />
                ))}
                {object.priorityDirections.length > 2 && (
                  <Chip
                    label={`+${object.priorityDirections.length - 2}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
