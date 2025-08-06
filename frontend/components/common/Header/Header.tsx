'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  AccountCircle,
  Language,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { setLanguage, toggleDarkMode, selectLanguage, selectIsDarkMode } from '@/store/slices/uiSlice';
import { LanguageCode } from '@/types';

const languages = [
  { code: 'ru' as LanguageCode, name: 'Русский', flag: '/flags/ru.svg' },
  { code: 'kz' as LanguageCode, name: 'Қазақша', flag: '/flags/kz.svg' },
  { code: 'en' as LanguageCode, name: 'English', flag: '/flags/en.svg' },
];

export default function Header() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentLanguage = useAppSelector(selectLanguage);
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  const handleLanguageChange = (langCode: LanguageCode) => {
    dispatch(setLanguage(langCode));
    setAnchorElLang(null);
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    // TODO: Implement logout
    handleUserMenuClose();
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={1}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
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
                  fontSize: 20,
                }}
              >
                DA
              </Box>
              {!isMobile && (
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  {t('app_name')}
                </Typography>
              )}
            </Box>
          </Link>
        </Box>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Selector */}
          <Button
            startIcon={<Language />}
            endIcon={
              <Image
                src={currentLang.flag}
                alt={currentLang.name}
                width={20}
                height={14}
                style={{ marginLeft: 4 }}
              />
            }
            onClick={(e) => setAnchorElLang(e.currentTarget)}
            sx={{ textTransform: 'none' }}
          >
            {!isMobile && currentLang.code.toUpperCase()}
          </Button>
          <Menu
            anchorEl={anchorElLang}
            open={Boolean(anchorElLang)}
            onClose={() => setAnchorElLang(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {languages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                selected={lang.code === currentLanguage}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Image src={lang.flag} alt={lang.name} width={24} height={16} />
                  <Typography>{lang.name}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* Theme Toggle */}
          <IconButton onClick={handleThemeToggle} color="inherit">
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* User Menu */}
          {isAuthenticated && user ? (
            <>
              <IconButton onClick={handleUserMenuOpen} color="inherit">
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>
                  <Typography variant="subtitle2">{user.name}</Typography>
                </MenuItem>
                <MenuItem disabled>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                {(user.role === 'SUPER_ADMIN' || user.role === 'EDITOR') && (
                  <MenuItem
                    onClick={() => {
                      router.push('/admin');
                      handleUserMenuClose();
                    }}
                  >
                    <AdminPanelSettings sx={{ mr: 1 }} />
                    {t('nav.admin')}
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  {t('common.logout', 'Выйти')}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <IconButton
              onClick={() => router.push('/login')}
              color="inherit"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <AccountCircle />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
