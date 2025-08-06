'use client';

import { Box, Typography, Chip, Button, Stack, Link as MuiLink, Divider } from '@mui/material';
import {
  LocationOn,
  Phone,
  Language,
  Business,
  Info,
  DirectionsCar,
  Share,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { DigitalObject } from '@/types';
import { openInGoogleMaps, buildRoute } from '@/lib/utils/map.utils';

interface ObjectInfoWindowProps {
  object: DigitalObject;
}

export default function ObjectInfoWindow({ object }: ObjectInfoWindowProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: object.name,
          text: object.address,
          url: `${window.location.origin}/objects/${object.id}`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleViewDetails = () => {
    router.push(`/objects/${object.id}`);
  };

  return (
    <Box sx={{ p: 2, minWidth: 300 }}>
      {/* Тип инфраструктуры */}
      <Chip
        icon={<Business sx={{ fontSize: 16 }} />}
        label={object.infrastructureType.name}
        size="small"
        sx={{
          backgroundColor: object.infrastructureType.color,
          color: 'white',
          mb: 2,
        }}
      />

      {/* Название */}
      <Typography variant="h6" component="h3" gutterBottom>
        {object.name}
      </Typography>

      {/* Адрес */}
      {object.address && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mr: 1, mt: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {object.address}
          </Typography>
        </Box>
      )}

      {/* Приоритетные направления */}
      {object.priorityDirections.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {object.priorityDirections.slice(0, 3).map((direction) => (
              <Chip
                key={direction.id}
                label={direction.name}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {object.priorityDirections.length > 3 && (
              <Chip
                label={`+${object.priorityDirections.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Контакты */}
      <Stack spacing={1}>
        {/* Телефоны */}
        {object.phones.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Phone sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <MuiLink
              href={`tel:${object.phones[0].number}`}
              underline="hover"
              variant="body2"
            >
              {object.phones[0].number}
            </MuiLink>
          </Box>
        )}

        {/* Веб-сайт */}
        {object.website && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Language sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <MuiLink
              href={object.website}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 200,
              }}
            >
              {object.website.replace(/^https?:\/\//, '')}
            </MuiLink>
          </Box>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Действия */}
      <Stack direction="row" spacing={1}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Info />}
          onClick={handleViewDetails}
          fullWidth
        >
          {t('object.details')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DirectionsCar />}
          onClick={() => buildRoute(object)}
          sx={{ minWidth: 0, px: 1 }}
        >
          {t('object.build_route')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleShare}
          sx={{ minWidth: 0, px: 1 }}
        >
          <Share fontSize="small" />
        </Button>
      </Stack>
    </Box>
  );
}
