'use client';

import { Grid, Card, CardContent, Typography, Box, Chip, Link as MuiLink } from '@mui/material';
import { Language, Business, LocationOn, Category } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DigitalObject } from '@/types';

interface ObjectInfoTabProps {
  object: DigitalObject;
}

export default function ObjectInfoTab({ object }: ObjectInfoTabProps) {
  const { t } = useTranslation();

  const infoCards = [
    {
      icon: <Business />,
      title: t('object.infrastructure_type', 'Тип инфраструктуры'),
      content: (
        <Chip
          label={object.infrastructureType.name}
          sx={{
            backgroundColor: object.infrastructureType.color,
            color: 'white',
          }}
        />
      ),
    },
    {
      icon: <LocationOn />,
      title: t('object.region', 'Регион'),
      content: object.region.name,
    },
    object.website && {
      icon: <Language />,
      title: t('object.website'),
      content: (
        <MuiLink
          href={object.website}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          {object.website.replace(/^https?:\/\//, '')}
        </MuiLink>
      ),
    },
    object.priorityDirections?.length > 0 && {
      icon: <Category />,
      title: t('object.priority_directions', 'Приоритетные направления'),
      content: (
        <Box sx={{ mt: 1 }}>
          {object.priorityDirections.map((dir) => (
            <Chip
              key={dir.id}
              label={dir.name}
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      ),
    },
  ].filter(Boolean);

  return (
    <Grid container spacing={3}>
      {infoCards.map((card, index) => card && (
        <Grid item xs={12} md={6} key={index}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ color: 'primary.main', mr: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {card.title}
                </Typography>
              </Box>
              <Box>
                {typeof card.content === 'string' ? (
                  <Typography variant="body1">{card.content}</Typography>
                ) : (
                  card.content
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
