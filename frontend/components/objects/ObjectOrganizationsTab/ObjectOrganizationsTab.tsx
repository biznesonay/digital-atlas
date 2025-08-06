'use client';

import { Grid, Card, CardContent, Typography, Link as MuiLink, Box } from '@mui/material';
import { Business, Language } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Organization } from '@/types';

interface ObjectOrganizationsTabProps {
  organizations: Organization[];
}

export default function ObjectOrganizationsTab({ organizations }: ObjectOrganizationsTabProps) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      {organizations.map((org) => (
        <Grid item xs={12} md={6} key={org.id}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Business sx={{ color: 'primary.main', mr: 2, mt: 0.5 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {org.name}
                  </Typography>
                  {org.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Language sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
                      <MuiLink
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        variant="body2"
                      >
                        {org.website.replace(/^https?:\/\//, '')}
                      </MuiLink>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
