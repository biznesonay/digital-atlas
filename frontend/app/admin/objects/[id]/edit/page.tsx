'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store';
import { selectLanguage } from '@/store/slices/uiSlice';
import ObjectForm from '@/components/admin/ObjectForm';
import { ObjectsAPI } from '@/lib/api/objects.api';

export default function EditObjectPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams();
  const language = useAppSelector(selectLanguage);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    loadObject();
  }, [id]);

  const loadObject = async () => {
    try {
      setLoading(true);
      const response = await ObjectsAPI.getObjectById(Number(id), language);
      
      // Преобразуем данные объекта в формат формы
      const object = response.data;
      setFormData({
        infrastructureTypeId: object.infrastructureType.id,
        regionId: object.region.id,
        translations: {
          ru: object.translations.find((t: any) => t.languageCode === 'ru') || { name: '', address: '', isPublished: false },
          kz: object.translations.find((t: any) => t.languageCode === 'kz') || { name: '', address: '', isPublished: false },
          en: object.translations.find((t: any) => t.languageCode === 'en') || { name: '', address: '', isPublished: false },
        },
        phones: object.phones || [],
        priorityDirectionIds: object.priorityDirections.map((pd: any) => pd.id),
        organizations: object.organizations || [],
        website: object.website || '',
        googleMapsUrl: object.googleMapsUrl || '',
        latitude: object.latitude,
        longitude: object.longitude,
      });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка загрузки объекта');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (data: any) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Подготовка данных для отправки
      const dataToSend = {
        ...formData,
        // Убираем пустые переводы
        translations: Object.fromEntries(
          Object.entries(formData.translations).filter(([_, trans]: any) => 
            trans.name && trans.address
          )
        ),
        // Преобразуем ID в числа
        infrastructureTypeId: Number(formData.infrastructureTypeId),
        regionId: Number(formData.regionId),
        priorityDirectionIds: formData.priorityDirectionIds.map(Number),
      };
      
      await ObjectsAPI.updateObject(Number(id), dataToSend);
      router.push('/admin/objects');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка при сохранении объекта');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !formData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => router.push('/admin/objects')}>
          Вернуться к списку
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/admin/objects')}
          sx={{ mb: 2 }}
        >
          Назад к списку
        </Button>
        <Typography variant="h4">
          Редактирование объекта
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Форма */}
      <Paper sx={{ p: 3 }}>
        {formData && (
          <Box>
            <ObjectForm
              data={formData}
              onChange={handleFormChange}
              activeStep={0}
              onNext={() => {}}
              onBack={() => {}}
              onSubmit={() => {}}
              loading={saving}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                Сохранить изменения
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
