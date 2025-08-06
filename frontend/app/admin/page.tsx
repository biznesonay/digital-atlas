'use client';

import { Grid, Card, CardContent, Typography, Box, Button, Stack } from '@mui/material';
import {
  Add,
  FileUpload,
  People,
  Settings,
  Business,
  Map,
  TrendingUp,
  History,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth({ allowedRoles: ['SUPER_ADMIN', 'EDITOR'] });

  const dashboardCards = [
    {
      title: 'Объекты',
      icon: <Business fontSize="large" />,
      description: 'Управление объектами инфраструктуры',
      action: () => router.push('/admin/objects'),
      stats: '12 объектов',
      color: '#1976D2',
    },
    {
      title: 'Импорт данных',
      icon: <FileUpload fontSize="large" />,
      description: 'Импорт объектов из Excel',
      action: () => router.push('/admin/import'),
      stats: 'Последний: вчера',
      color: '#388E3C',
    },
    {
      title: 'Пользователи',
      icon: <People fontSize="large" />,
      description: 'Управление пользователями',
      action: () => router.push('/admin/users'),
      stats: '3 пользователя',
      color: '#7B1FA2',
      disabled: user?.role !== 'SUPER_ADMIN',
    },
    {
      title: 'Настройки',
      icon: <Settings fontSize="large" />,
      description: 'Управление справочниками',
      action: () => router.push('/admin/settings'),
      stats: 'Справочники',
      color: '#F57C00',
      disabled: user?.role !== 'SUPER_ADMIN',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Панель управления
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Добро пожаловать, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        {dashboardCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                cursor: card.disabled ? 'not-allowed' : 'pointer',
                opacity: card.disabled ? 0.6 : 1,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: card.disabled ? 'none' : 'translateY(-4px)',
                  boxShadow: card.disabled ? 1 : 4,
                },
              }}
              onClick={!card.disabled ? card.action : undefined}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    backgroundColor: card.color,
                    color: 'white',
                    mb: 2,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {card.description}
                </Typography>
                <Typography variant="caption" color="primary">
                  {card.stats}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Быстрые действия */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Быстрые действия
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/admin/objects/create')}
          >
            Добавить объект
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUpload />}
            onClick={() => router.push('/admin/import')}
          >
            Импортировать из Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => router.push('/admin/import/history')}
          >
            История импорта
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
