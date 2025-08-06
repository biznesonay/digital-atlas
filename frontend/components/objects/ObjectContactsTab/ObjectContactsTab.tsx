'use client';

import { Grid, Card, CardContent, Typography, Box, Link as MuiLink, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Phone, Language, LocationOn, Email } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { DigitalObject } from '@/types';

interface ObjectContactsTabProps {
  object: DigitalObject;
}

export default function ObjectContactsTab({ object }: ObjectContactsTabProps) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3}>
      {/* Адрес */}
      {object.address && (
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('object.address')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <LocationOn sx={{ color: 'primary.main', mr: 2, mt: 1 }} />
                <Typography variant="body1">
                  {object.address}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Телефоны */}
      {object.phones?.length > 0 && (
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('object.phones')}
              </Typography>
              <List dense>
                {object.phones.map((phone) => (
                  <ListItem key={phone.id} disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Phone sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <MuiLink href={`tel:${phone.number}`} underline="hover">
                          {phone.number}
                        </MuiLink>
                      }
                      secondary={
                        phone.type === 'MAIN' ? t('object.phone_main', 'Основной') :
                        phone.type === 'ADDITIONAL' ? t('object.phone_additional', 'Дополнительный') :
                        phone.type === 'FAX' ? t('object.phone_fax', 'Факс') :
                        t('object.phone_mobile', 'Мобильный')
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Веб-сайт */}
      {object.website && (
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('object.website')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Language sx={{ color: 'primary.main', mr: 2 }} />
                <MuiLink
                  href={object.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  {object.website}
                </MuiLink>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
