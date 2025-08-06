'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ObjectForm from '@/components/admin/ObjectForm';
import { ObjectsAPI } from '@/lib/api/objects.api';

const steps = ['Основная информация', 'Контакты', 'Дополнительно'];

export default function CreateObjectPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    infrastructureTypeId: null,
    regionId: null,
    translations: {
      ru: { name: '', address: '', isPublished: true },
      kz: { name: '', address: '', isPublished: true },
      en: { name: '', address: '', isPublished: true },
    },
    phones: [],
    priorityDirectionIds: [],
    organizations: [],
    website: '',
    googleMapsUrl: '',
    latitude: null,
    longitude: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFormChange = (data: any) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    setLoading(true);
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
      
      await ObjectsAPI.createObject(dataToSend);
      router.push('/admin/objects');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка при создании объекта');
    } finally {
      setLoading(false);
    }
  };

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
          Создание объекта
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Форма */}
      <Paper sx={{ p: 3 }}>
        <ObjectForm
          data={formData}
          onChange={handleFormChange}
          activeStep={activeStep}
          onNext={handleNext}
          onBack={handleBack}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Paper>
    </Box>
  );
}
