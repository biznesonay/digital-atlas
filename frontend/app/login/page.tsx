'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  ArrowBack,
} from '@mui/icons-material';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { login, clearAuthError, selectAuthLoading, selectAuthError, selectIsAuthenticated } from '@/store/slices/authSlice';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});

  useEffect(() => {
    // Очищаем ошибки при монтировании
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    // Редирект после успешного входа
    if (isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку для этого поля
    if (validationErrors[name]) {
      setValidationErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    
    if (!formData.email) {
      errors.email = t('auth.errors.email_required', 'Email обязателен');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('auth.errors.email_invalid', 'Некорректный email');
    }
    
    if (!formData.password) {
      errors.password = t('auth.errors.password_required', 'Пароль обязателен');
    } else if (formData.password.length < 6) {
      errors.password = t('auth.errors.password_min', 'Минимум 6 символов');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    dispatch(login({
      email: formData.email,
      password: formData.password,
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Кнопка назад */}
          <Box sx={{ mb: 3 }}>
            <Link href="/" passHref legacyBehavior>
              <MuiLink
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <ArrowBack sx={{ mr: 1 }} />
                {t('common.back_to_home', 'На главную')}
              </MuiLink>
            </Link>
          </Box>

          {/* Заголовок */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              {t('auth.login_title', 'Вход в систему')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('auth.login_subtitle', 'Войдите для доступа к административной панели')}
            </Typography>
          </Box>

          {/* Ошибка от сервера */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error === 'Login failed' 
                ? t('auth.errors.invalid_credentials', 'Неверный email или пароль')
                : error}
            </Alert>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={t('auth.password', 'Пароль')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.login_button', 'Войти')
              )}
            </Button>

            {/* Забыли пароль */}
            <Box sx={{ textAlign: 'center' }}>
              <MuiLink
                component="button"
                type="button"
                variant="body2"
                onClick={() => {/* TODO: Implement forgot password */}}
                disabled={loading}
              >
                {t('auth.forgot_password', 'Забыли пароль?')}
              </MuiLink>
            </Box>
          </form>

          {/* Тестовые данные для разработки */}
          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="caption">
                Тестовый аккаунт:<br />
                Email: admin@digitalatlas.kz<br />
                Пароль: Admin123!
              </Typography>
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
