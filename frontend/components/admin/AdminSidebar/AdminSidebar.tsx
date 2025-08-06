'use client';

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  Business,
  FileUpload,
  People,
  Settings,
  History,
  Home,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store';
import { selectUser } from '@/store/slices/authSlice';

const drawerWidth = 240;

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector(selectUser);

  const menuItems = [
    { 
      text: 'Главная', 
      icon: <Dashboard />, 
      path: '/admin' 
    },
    { 
      text: 'Объекты', 
      icon: <Business />, 
      path: '/admin/objects' 
    },
    { 
      text: 'Импорт данных', 
      icon: <FileUpload />, 
      path: '/admin/import' 
    },
    { 
      text: 'История импорта', 
      icon: <History />, 
      path: '/admin/import/history' 
    },
  ];

  const adminOnlyItems = [
    { 
      text: 'Пользователи', 
      icon: <People />, 
      path: '/admin/users' 
    },
    { 
      text: 'Настройки', 
      icon: <Settings />, 
      path: '/admin/settings' 
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              DA
            </Box>
            <Typography variant="h6">Digital Atlas</Typography>
          </Box>
        </Link>
      </Box>
      
      <Divider />
      
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      {user?.role === 'SUPER_ADMIN' && (
        <>
          <Divider />
          <List>
            {adminOnlyItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={pathname === item.path}
                  onClick={() => router.push(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push('/')}>
            <ListItemIcon><Home /></ListItemIcon>
            <ListItemText primary="На сайт" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
