'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Person,
  CalendarToday,
  InsertDriveFile,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { apiClient } from '@/lib/api/client';

export default function ImportDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/import/history/${id}`);
      setRecord(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return {
          label: 'Успешно завершен',
          color: 'success' as const,
          icon: <CheckCircle />,
        };
      case 'PARTIAL':
        return {
          label: 'Завершен с ошибками',
          color: 'warning' as const,
          icon: <Warning />,
        };
      case 'FAILED':
        return {
          label: 'Завершен с ошибкой',
          color: 'error' as const,
          icon: <ErrorIcon />,
        };
      case 'PROCESSING':
        return {
          label: 'В процессе',
          color: 'info' as const,
          icon: null,
        };
      default:
        return {
          label: status,
          color: 'default' as const,
          icon: null,
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !record) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Запись не найдена'}
        </Alert>
        <Button onClick={() => router.push('/admin/import/history')}>
          Вернуться к истории
        </Button>
      </Box>
    );
  }

  const statusInfo = getStatusInfo(record.status);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/admin/import/history')}
        >
          К истории импорта
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Детали импорта #{record.id}
        </Typography>
      </Stack>

      {/* Общая информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <InsertDriveFile sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Файл
                </Typography>
                <Typography variant="body1">{record.filename}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <Person sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Пользователь
                </Typography>
                <Typography variant="body1">{record.user?.name || 'N/A'}</Typography>
                <Typography variant="caption">{record.user?.email}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  <CalendarToday sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  Дата импорта
                </Typography>
                <Typography variant="body1">
                  {format(new Date(record.createdAt), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                </Typography>
                {record.completedAt && (
                  <Typography variant="caption">
                    Завершен: {format(new Date(record.completedAt), 'HH:mm:ss', { locale: ru })}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label={statusInfo.label}
                color={statusInfo.color}
                icon={statusInfo.icon || undefined}
                sx={{ mb: 3 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="h4">{record.totalRows}</Typography>
                    <Typography variant="caption">Всего строк</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.dark' }}>
                    <Typography variant="h4">{record.successRows}</Typography>
                    <Typography variant="caption">Успешно</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.dark' }}>
                    <Typography variant="h4">{record.errorRows}</Typography>
                    <Typography variant="caption">Ошибок</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Ошибки импорта */}
      {record.errors && record.errors.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ошибки импорта
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={100}>Строка</TableCell>
                  <TableCell>Ошибка</TableCell>
                  <TableCell>Данные</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {record.errors.map((error: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip label={`Строка ${error.row}`} size="small" />
                    </TableCell>
                    <TableCell>{error.error}</TableCell>
                    <TableCell>
                      <Typography variant="caption" component="pre" sx={{ maxWidth: 400, overflow: 'auto' }}>
                        {JSON.stringify(error.data, null, 2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
