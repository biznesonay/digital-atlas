'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  Button,
  Stack,
  Typography,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import {
  Add,
  Delete,
  MyLocation,
  Language,
  Phone,
  Business,
} from '@mui/icons-material';
import { useAppSelector } from '@/store';
import {
  selectInfrastructureTypes,
  selectRegions,
  selectPriorityDirections,
} from '@/store/slices/referencesSlice';
import { GeocodingUtil } from '@/lib/utils/map.utils';

interface ObjectFormProps {
  data: any;
  onChange: (data: any) => void;
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  loading?: boolean;
}

export default function ObjectForm({
  data,
  onChange,
  activeStep,
  onNext,
  onBack,
  onSubmit,
  loading = false,
}: ObjectFormProps) {
  const infrastructureTypes = useAppSelector(selectInfrastructureTypes);
  const regions = useAppSelector(selectRegions);
  const priorityDirections = useAppSelector(selectPriorityDirections);
  
  const [activeTab, setActiveTab] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneType, setPhoneType] = useState('MAIN');
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');

  // Извлечение координат из Google Maps URL
  const handleExtractCoordinates = () => {
    if (data.googleMapsUrl) {
      const coords = GeocodingUtil.extractCoordinatesFromUrl(data.googleMapsUrl);
      if (coords) {
        onChange({
          ...data,
          latitude: coords.lat,
          longitude: coords.lng,
        });
      }
    }
  };

  // Добавление телефона
  const handleAddPhone = () => {
    if (phoneNumber) {
      onChange({
        ...data,
        phones: [...data.phones, { number: phoneNumber, type: phoneType }],
      });
      setPhoneNumber('');
      setPhoneType('MAIN');
    }
  };

  // Удаление телефона
  const handleRemovePhone = (index: number) => {
    onChange({
      ...data,
      phones: data.phones.filter((_: any, i: number) => i !== index),
    });
  };

  // Добавление организации
  const handleAddOrganization = () => {
    if (orgName) {
      onChange({
        ...data,
        organizations: [...data.organizations, { name: orgName, website: orgWebsite }],
      });
      setOrgName('');
      setOrgWebsite('');
    }
  };

  // Удаление организации
  const handleRemoveOrganization = (index: number) => {
    onChange({
      ...data,
      organizations: data.organizations.filter((_: any, i: number) => i !== index),
    });
  };

  // Валидация текущего шага
  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Основная информация
        return (
          data.infrastructureTypeId &&
          data.regionId &&
          (data.translations.ru.name || data.translations.kz.name || data.translations.en.name) &&
          (data.translations.ru.address || data.translations.kz.address || data.translations.en.address)
        );
      case 1: // Контакты
        return true; // Контакты необязательны
      case 2: // Дополнительно
        return true; // Дополнительная информация необязательна
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0: // Основная информация
        return (
          <Box>
            <Grid container spacing={3}>
              {/* Тип инфраструктуры */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={infrastructureTypes.find(t => t.id === data.infrastructureTypeId) || null}
                  onChange={(_, value) => onChange({ ...data, infrastructureTypeId: value?.id || null })}
                  options={infrastructureTypes}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Тип инфраструктуры"
                      required
                    />
                  )}
                />
              </Grid>

              {/* Регион */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  value={regions.find(r => r.id === data.regionId) || null}
                  onChange={(_, value) => onChange({ ...data, regionId: value?.id || null })}
                  options={regions}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Регион"
                      required
                    />
                  )}
                />
              </Grid>

              {/* Языковые вкладки */}
              <Grid item xs={12}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                  <Tab label="Русский" icon={<Language />} iconPosition="start" />
                  <Tab label="Қазақша" icon={<Language />} iconPosition="start" />
                  <Tab label="English" icon={<Language />} iconPosition="start" />
                </Tabs>
                
                <Box sx={{ mt: 3 }}>
                  {activeTab === 0 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Название (RU)"
                          value={data.translations.ru.name}
                          onChange={(e) => onChange({
                            ...data,
                            translations: {
                              ...data.translations,
                              ru: { ...data.translations.ru, name: e.target.value }
                            }
                          })}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Адрес (RU)"
                          value={data.translations.ru.address}
                          onChange={(e) => onChange({
                            ...data,
                            translations: {
                              ...data.translations,
                              ru: { ...data.translations.ru, address: e.target.value }
                            }
                          })}
                          multiline
                          rows={2}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={data.translations.ru.isPublished}
                              onChange={(e) => onChange({
                                ...data,
                                translations: {
                                  ...data.translations,
                                  ru: { ...data.translations.ru, isPublished: e.target.checked }
                                }
                              })}
                            />
                          }
                          label="Опубликовать"
                        />
                      </Grid>
                    </Grid>
                  )}
                  
                  {activeTab === 1 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Атауы (KZ)"
                          value={data.translations.kz.name}
                          onChange={(e) => onChange({
                            ...data,
                            translations: {
                              ...data.translations,
                              kz: { ...data.translations.kz, name: e.target.value }
                            }
                          })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Мекенжайы (KZ)"
                          value={data.translations.kz.address}
                          onChange={(e) => onChange({
                            ...data,
                            translations: {
                              ...data.translations,
                              kz: { ...data.translations.kz, address: e.target.value }
                            }
                          })}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={data.translations.kz.isPublished}
                              onChange={(e) => onChange({
                                ...data,
                                translations: {
                                  ...data.translations,
                                  kz: { ...data.translations.kz, isPublished: e.target.checked }
                                }
                              })}
                            />
                          }
                          label="Жариялау"
                        />
                      </Grid>
                    </Grid>
                  )}
                  
                  {activeTab === 2 && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Name (EN)"
                          value={data.translations.en.name}
                          onChange={(e) => onChange({
                            ...data,
                            translations: {
                              ...data.translations,
                              en: { ...data.translations.en, name: e.target.value }
                            }
                          })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address (EN)"
                          value={data.translations.en.address}
                          onChange={(e) => onChange({
                            ...data,
                            translations: {
                              ...data.translations,
                              en: { ...data.translations.en, address: e.target.value }
                            }
                          })}
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={data.translations.en.isPublished}
                              onChange={(e) => onChange({
                                ...data,
                                translations: {
                                  ...data.translations,
                                  en: { ...data.translations.en, isPublished: e.target.checked }
                                }
                              })}
                            />
                          }
                          label="Publish"
                        />
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1: // Контакты
        return (
          <Box>
            <Grid container spacing={3}>
              {/* Веб-сайт */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Веб-сайт"
                  value={data.website}
                  onChange={(e) => onChange({ ...data, website: e.target.value })}
                  placeholder="https://example.kz"
                />
              </Grid>

              {/* Google Maps */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ссылка на Google Maps"
                  value={data.googleMapsUrl}
                  onChange={(e) => onChange({ ...data, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  InputProps={{
                    endAdornment: data.googleMapsUrl && (
                      <IconButton onClick={handleExtractCoordinates} edge="end">
                        <MyLocation />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              {/* Координаты */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Широта"
                  type="number"
                  value={data.latitude || ''}
                  onChange={(e) => onChange({ ...data, latitude: e.target.value ? Number(e.target.value) : null })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Долгота"
                  type="number"
                  value={data.longitude || ''}
                  onChange={(e) => onChange({ ...data, longitude: e.target.value ? Number(e.target.value) : null })}
                />
              </Grid>

              {/* Телефоны */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Телефоны
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+7 xxx xxx xx xx"
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Autocomplete
                    value={phoneType}
                    onChange={(_, value) => setPhoneType(value || 'MAIN')}
                    options={['MAIN', 'ADDITIONAL', 'FAX', 'MOBILE']}
                    getOptionLabel={(option) => ({
                      'MAIN': 'Основной',
                      'ADDITIONAL': 'Дополнительный',
                      'FAX': 'Факс',
                      'MOBILE': 'Мобильный'
                    }[option] || option)}
                    renderInput={(params) => <TextField {...params} size="small" />}
                    sx={{ width: 200 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddPhone}
                    disabled={!phoneNumber}
                  >
                    <Add />
                  </Button>
                </Stack>

                <List dense>
                  {data.phones.map((phone: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={phone.number}
                        secondary={{
                          'MAIN': 'Основной',
                          'ADDITIONAL': 'Дополнительный',
                          'FAX': 'Факс',
                          'MOBILE': 'Мобильный'
                        }[phone.type]}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemovePhone(index)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2: // Дополнительно
        return (
          <Box>
            <Grid container spacing={3}>
              {/* Приоритетные направления */}
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  value={priorityDirections.filter(pd => data.priorityDirectionIds.includes(pd.id))}
                  onChange={(_, values) => onChange({
                    ...data,
                    priorityDirectionIds: values.map(v => v.id)
                  })}
                  options={priorityDirections}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Приоритетные направления"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
                        size="small"
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </Grid>

              {/* Организации */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Организации
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Название организации"
                    size="small"
                  />
                  <TextField
                    value={orgWebsite}
                    onChange={(e) => setOrgWebsite(e.target.value)}
                    placeholder="Веб-сайт (необязательно)"
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddOrganization}
                    disabled={!orgName}
                    fullWidth
                  >
                    <Add sx={{ mr: 1 }} />
                    Добавить организацию
                  </Button>
                </Stack>

                <List dense>
                  {data.organizations.map((org: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={org.name}
                        secondary={org.website}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleRemoveOrganization(index)}>
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      {renderStep()}
      
      {/* Кнопки навигации */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={onBack}
        >
          Назад
        </Button>
        
        {activeStep === 2 ? (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading || !isStepValid()}
          >
            Создать объект
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!isStepValid()}
          >
            Далее
          </Button>
        )}
      </Box>
    </Box>
  );
}
