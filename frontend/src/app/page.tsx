// frontend/src/app/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Alert, 
  Drawer,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchObjects } from '@/store/slices/objectsSlice';
import { toggleSidebar } from '@/store/slices/uiSlice';
import InteractiveMap from '@/components/map/InteractiveMap';
import FilterPanel from '@/components/filters/FilterPanel';
import ObjectsList from '@/components/objects/ObjectsList';

const DRAWER_WIDTH = 400;

export default function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.objects);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  useEffect(() => {
    // Загружаем объекты при монтировании компонента
    dispatch(fetchObjects());
  }, [dispatch]);

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Хедер */}
      <Box 
        component="header" 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 2,
          position: 'relative',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
              Цифровой атлас инновационной инфраструктуры
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Основной контент */}
      <Box sx={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Боковая панель */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left"
          open={sidebarOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: { xs: 0, md: 64 }, // Высота хедера
              height: { xs: '100%', md: 'calc(100% - 64px)' },
            },
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Заголовок боковой панели */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                Объекты ({items.length})
              </Typography>
              <IconButton onClick={handleDrawerToggle}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
            <Divider />
            
            {/* Список объектов */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {error ? (
                <Alert severity="error" sx={{ m: 2 }}>
                  Ошибка загрузки: {error}
                </Alert>
              ) : (
                <ObjectsList />
              )}
            </Box>
          </Box>
        </Drawer>

        {/* Контент с картой */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            ml: sidebarOpen && !isMobile ? `${DRAWER_WIDTH}px` : 0,
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Панель фильтров */}
          <Box sx={{ p: 2 }}>
            <FilterPanel />
          </Box>

          {/* Карта */}
          <Box sx={{ flex: 1, position: 'relative' }}>
            <InteractiveMap />
          </Box>
        </Box>
      </Box>

      {/* Предупреждение если нет ключа Google Maps */}
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            maxWidth: 600,
            zIndex: theme.zIndex.snackbar,
          }}
        >
          Для отображения карты необходимо добавить Google Maps API ключ в файл .env.local
        </Alert>
      )}
    </Box>
  );
}