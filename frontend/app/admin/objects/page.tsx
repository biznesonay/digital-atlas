'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  MoreVert,
  LocationOn,
  FilterList,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchObjects, selectAllObjects, selectObjectsLoading, selectObjectsMeta } from '@/store/slices/objectsSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { ObjectsAPI } from '@/lib/api/objects.api';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function AdminObjectsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const objects = useAppSelector(selectAllObjects);
  const loading = useAppSelector(selectObjectsLoading);
  const meta = useAppSelector(selectObjectsMeta);
  const language = useAppSelector(selectLanguage);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadObjects();
  }, [page, rowsPerPage, search, language]);

  const loadObjects = () => {
    dispatch(fetchObjects({
      filters: { search },
      lang: language,
      page: page + 1,
      limit: rowsPerPage,
    }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, object: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedObject(object);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedObject(null);
  };

  const handleView = () => {
    if (selectedObject) {
      window.open(`/objects/${selectedObject.id}`, '_blank');
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedObject) {
      router.push(`/admin/objects/${selectedObject.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedObject) return;
    
    setDeleteLoading(true);
    try {
      await ObjectsAPI.deleteObject(selectedObject.id);
      loadObjects();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete object:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCoordinatesStatus = (object: any) => {
    if (object.latitude && object.longitude) {
      return <Chip label="Есть координаты" size="small" color="success" />;
    }
    return <Chip label="Нет координат" size="small" color="warning" />;
  };

  return (
    <Box>
      {/* Заголовок и действия */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Управление объектами
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {/* TODO: Export */}}
          >
            Экспорт
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push('/admin/objects/create')}
          >
            Добавить объект
          </Button>
        </Stack>
      </Box>

      {/* Поиск и фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Поиск по названию или адресу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => {/* TODO: Advanced filters */}}
          >
            Фильтры
          </Button>
        </Stack>
      </Paper>

      {/* Таблица */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Регион</TableCell>
              <TableCell>Координаты</TableCell>
              <TableCell>Обновлено</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : objects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Объекты не найдены
                </TableCell>
              </TableRow>
            ) : (
              objects.map((object) => (
                <TableRow key={object.id} hover>
                  <TableCell>{object.id}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {object.name}
                      </Typography>
                      {object.address && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                          {object.address}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={object.infrastructureType.name}
                      size="small"
                      sx={{
                        backgroundColor: object.infrastructureType.color,
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  <TableCell>{object.region.name}</TableCell>
                  <TableCell>{getCoordinatesStatus(object)}</TableCell>
                  <TableCell>
                    {format(new Date(object.updatedAt), 'dd MMM yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, object)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {meta && (
          <TablePagination
            component="div"
            count={meta.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
          />
        )}
      </TableContainer>

      {/* Меню действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} /> Просмотр
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} /> Редактировать
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Удаление объекта"
        content={`Вы уверены, что хотите удалить объект "${selectedObject?.name}"? Это действие необратимо.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleteLoading}
      />
    </Box>
  );
}
