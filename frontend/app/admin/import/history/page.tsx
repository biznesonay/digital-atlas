'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import {
  Visibility,
  Download,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { apiClient } from '@/lib/api/client';

export default function ImportHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadHistory();
  }, [page, rowsPerPage]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/import/history', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      
      setHistory(response.data || []);
      setTotal(response.meta?.total || 0);
    } catch (error) {
      console.error('Failed to load import history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Chip label="Успешно" color="success" size="small" icon={<CheckCircle />} />;
      case 'PARTIAL':
        return <Chip label="Частично" color="warning" size="small" icon={<Warning />} />;
      case 'FAILED':
        return <Chip label="Ошибка" color="error" size="small" icon={<ErrorIcon />} />;
      case 'PROCESSING':
        return <Chip label="В процессе" color="info" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleViewDetails = (id: number) => {
    router.push(`/admin/import/history/${id}`);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/admin/import')}
        >
          К импорту
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          История импорта
        </Typography>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Файл</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="center">Всего</TableCell>
              <TableCell align="center">Успешно</TableCell>
              <TableCell align="center">Ошибок</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  История импорта пуста
                </TableCell>
              </TableRow>
            ) : (
              history.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>{record.id}</TableCell>
                  <TableCell>{record.filename}</TableCell>
                  <TableCell>
                    {format(new Date(record.createdAt), 'dd MMM yyyy HH:mm', { locale: ru })}
                  </TableCell>
                  <TableCell>{record.user?.name || 'N/A'}</TableCell>
                  <TableCell>{getStatusChip(record.status)}</TableCell>
                  <TableCell align="center">{record.totalRows}</TableCell>
                  <TableCell align="center">{record.successRows}</TableCell>
                  <TableCell align="center">{record.errorRows}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(record.id)}
                      title="Подробности"
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {total > 0 && (
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        )}
      </TableContainer>
    </Box>
  );
}
