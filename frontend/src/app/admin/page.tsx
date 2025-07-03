// frontend/src/app/admin/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import MapIcon from '@mui/icons-material/Map';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

interface Stats {
  totalObjects: number;
  objectsByType: Array<{ type: string; count: number; color: string }>;
  objectsByRegion: Array<{ region: string; count: number }>;
  recentObjects: Array<{
    id: number;
    name: string;
    type: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalObjects: 0,
    objectsByType: [],
    objectsByRegion: [],
    recentObjects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Загружаем данные
      const [objectsRes, typesRes, regionsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/objects'),
        axios.get('http://localhost:3001/api/dictionaries/infrastructure-types'),
        axios.get('http://localhost:3001/api/dictionaries/regions'),
      ]);

      const objects = objectsRes.data.data || [];
      const types = typesRes.data.data || [];
      const regions = regionsRes.data.data || [];

      // Считаем статистику
      const objectsByType = types.map((type: any) => ({
        type: type.name,
        count: objects.filter((obj: any) => obj.infrastructureType.id === type.id).length,
        color: type.color,
      }));

      const objectsByRegion = regions.map((region: any) => ({
        region: region.name,
        count: objects.filter((obj: any) => obj.region.id === region.id).length,
      }));

      const recentObjects = objects
        .slice(0, 5)
        .map((obj: any) => ({
          id: obj.id,
          name: obj.name,
          type: obj.infrastructureType.name,
          createdAt: new Date().toLocaleDateString(),
        }));

      setStats({
        totalObjects: objects.length,
        objectsByType,
        objectsByRegion,
        recentObjects,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              bgcolor: color,
              color: 'white',
              p: 1,
              borderRadius: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Typography>Загрузка...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Карточки статистики */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Всего объектов"
            value={stats.totalObjects}
            icon={<LocationOnIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Типов инфраструктуры"
            value={stats.objectsByType.length}
            icon={<CategoryIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Регионов"
            value={stats.objectsByRegion.length}
            icon={<MapIcon />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активность"
            value="+15%"
            icon={<TrendingUpIcon />}
            color="success.main"
          />
        </Grid>

        {/* Статистика по типам */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Объекты по типам
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Тип</TableCell>
                    <TableCell align="right">Количество</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.objectsByType.map((item) => (
                    <TableRow key={item.type}>
                      <TableCell>
                        <Chip
                          label={item.type}
                          size="small"
                          sx={{
                            bgcolor: item.color,
                            color: 'white',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Статистика по регионам */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Объекты по регионам
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Регион</TableCell>
                    <TableCell align="right">Количество</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.objectsByRegion.map((item) => (
                    <TableRow key={item.region}>
                      <TableCell>{item.region}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Последние объекты */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Последние добавленные объекты
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Дата добавления</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentObjects.map((obj) => (
                    <TableRow key={obj.id}>
                      <TableCell>{obj.id}</TableCell>
                      <TableCell>{obj.name}</TableCell>
                      <TableCell>
                        <Chip label={obj.type} size="small" />
                      </TableCell>
                      <TableCell>{obj.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}