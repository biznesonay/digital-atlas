// frontend/src/app/admin/objects/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';

interface ObjectData {
  id: number;
  name: string;
  address: string;
  infrastructureType: { id: number; name: string; color: string };
  region: { id: number; name: string };
  latitude?: number;
  longitude?: number;
  website?: string;
  phones: Array<{ number: string }>;
}

export default function AdminObjectsPage() {
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Диалоги
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
  
  // Справочники
  const [infrastructureTypes, setInfrastructureTypes] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  
  // Форма
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    infrastructureTypeId: '',
    regionId: '',
    latitude: '',
    longitude: '',
    website: '',
    phone: '',
  });
  
  // Уведомления
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [objectsRes, typesRes, regionsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/objects'),
        axios.get('http://localhost:3001/api/dictionaries/infrastructure-types'),
        axios.get('http://localhost:3001/api/dictionaries/regions'),
      ]);

      setObjects(objectsRes.data.data || []);
      setInfrastructureTypes(typesRes.data.data || []);
      setRegions(regionsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showSnackbar('Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (object?: ObjectData) => {
    if (object) {
      setSelectedObject(object);
      setFormData({
        name: object.name,
        address: object.address,
        infrastructureTypeId: object.infrastructureType.id.toString(),
        regionId: object.region.id.toString(),
        latitude: object.latitude?.toString() || '',
        longitude: object.longitude?.toString() || '',
        website: object.website || '',
        phone: object.phones[0]?.number || '',
      });
    } else {
      setSelectedObject(null);
      setFormData({
        name: '',
        address: '',
        infrastructureTypeId: '',
        regionId: '',
        latitude: '',
        longitude: '',
        website: '',
        phone: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedObject(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = {
        infrastructureTypeId: parseInt(formData.infrastructureTypeId),
        regionId: parseInt(formData.regionId),
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        website: formData.website || undefined,
        translations: [
          {
            languageCode: 'ru',
            name: formData.name,
            address: formData.address,
            isPublished: true,
          },
        ],
        phones: formData.phone ? [{ number: formData.phone, type: 'MAIN' }] : [],
      };

      if (selectedObject) {
        // Обновление
        await axios.put(
          `http://localhost:3001/api/objects/${selectedObject.id}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showSnackbar('Объект успешно обновлен', 'success');
      } else {
        // Создание
        await axios.post('http://localhost:3001/api/objects', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showSnackbar('Объект успешно создан', 'success');
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Error saving object:', error);
      showSnackbar(error.response?.data?.error || 'Ошибка сохранения', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedObject) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/objects/${selectedObject.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showSnackbar('Объект успешно удален', 'success');
      setDeleteDialog(false);
      setSelectedObject(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting object:', error);
      showSnackbar(error.response?.data?.error || 'Ошибка удаления', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Управление объектами</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить объект
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Регион</TableCell>
                <TableCell>Адрес</TableCell>
                <TableCell align="center">Координаты</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {objects
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((object) => (
                  <TableRow key={object.id}>
                    <TableCell>{object.id}</TableCell>
                    <TableCell>{object.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={object.infrastructureType.name}
                        size="small"
                        sx={{
                          bgcolor: object.infrastructureType.color,
                          color: 'white',
                        }}
                      />
                    </TableCell>
                    <TableCell>{object.region.name}</TableCell>
                    <TableCell>{object.address}</TableCell>
                    <TableCell align="center">
                      {object.latitude && object.longitude ? (
                        <Chip
                          icon={<LocationOnIcon />}
                          label="Есть"
                          size="small"
                          color="success"
                        />
                      ) : (
                        <Chip label="Нет" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => window.open(`/?objectId=${object.id}`, '_blank')}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(object)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedObject(object);
                          setDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={objects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Строк на странице:"
        />
      </Paper>

      {/* Диалог создания/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedObject ? 'Редактировать объект' : 'Добавить новый объект'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Адрес"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Тип инфраструктуры</InputLabel>
              <Select
                value={formData.infrastructureTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, infrastructureTypeId: e.target.value })
                }
                label="Тип инфраструктуры"
              >
                {infrastructureTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Регион</InputLabel>
              <Select
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                label="Регион"
              >
                {regions.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Широта"
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              />
              <TextField
                fullWidth
                label="Долгота"
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Веб-сайт"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
            <TextField
              fullWidth
              label="Телефон"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить объект "{selectedObject?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}