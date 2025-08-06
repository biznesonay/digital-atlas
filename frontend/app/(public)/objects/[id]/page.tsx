'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Tabs,
  Tab,
  Button,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Grid,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Phone,
  Language,
  Business,
  DirectionsCar,
  Share,
  Map as MapIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchObjectById } from '@/store/slices/objectsSlice';
import { selectLanguage } from '@/store/slices/uiSlice';
import { buildRoute, openInGoogleMaps } from '@/lib/utils/map.utils';
import ObjectInfoTab from '@/components/objects/ObjectInfoTab';
import ObjectOrganizationsTab from '@/components/objects/ObjectOrganizationsTab';
import ObjectContactsTab from '@/components/objects/ObjectContactsTab';

// Динамический импорт мини-карты
const ObjectMiniMap = dynamic(
  () => import('@/components/map/ObjectMiniMap'),
  { ssr: false }
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`object-tabpanel-${index}`}
      aria-labelledby={`object-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ObjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const language = useAppSelector(selectLanguage);
  const [object, setObject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const loadObject = async () => {
      try {
        setLoading(true);
        const result = await dispatch(fetchObjectById({ 
          id: Number(id), 
          lang: language 
        })).unwrap();
        setObject(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load object');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadObject();
    }
  }, [id, language, dispatch]);

  const handleShare = async () => {
    if (navigator.share && object) {
      try {
        await navigator.share({
          title: object.name,
          text: object.address,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback - копировать ссылку
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !object) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || t('common.error')}
          <Button onClick={() => router.push('/')} sx={{ ml: 2 }}>
            {t('common.back_to_home', 'Вернуться на главную')}
          </Button>
        </Alert>
      </Container>
    );
  }

  // Определяем доступные вкладки на основе данных
  const tabs = [];
  
  // Вкладка "Общая информация" всегда показывается
  tabs.push({ label: t('object.tabs.info', 'Общая информация'), component: <ObjectInfoTab object={object} /> });
  
  // Вкладка "Организации" только если есть организации
  if (object.organizations?.length > 0) {
    tabs.push({ label: t('object.tabs.organizations', 'Организации'), component: <ObjectOrganizationsTab organizations={object.organizations} /> });
  }
  
  // Вкладка "Контакты" если есть телефоны, сайт или адрес
  if (object.phones?.length > 0 || object.website || object.address) {
    tabs.push({ label: t('object.tabs.contacts', 'Контакты'), component: <ObjectContactsTab object={object} /> });
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Хлебные крошки */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" passHref legacyBehavior>
            <MuiLink color="inherit">{t('nav.home')}</MuiLink>
          </Link>
          <Typography color="text.primary">{object.name}</Typography>
        </Breadcrumbs>

        {/* Основная информация */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              {/* Заголовок с кнопкой назад */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                  <ArrowBack />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                  <Chip
                    icon={<Business sx={{ fontSize: 16 }} />}
                    label={object.infrastructureType.name}
                    sx={{
                      backgroundColor: object.infrastructureType.color,
                      color: 'white',
                      mb: 2,
                    }}
                  />
                  <Typography variant="h4" component="h1" gutterBottom>
                    {object.name}
                  </Typography>
                  {object.address && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                      <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mr: 1, mt: 0.5 }} />
                      <Typography variant="body1" color="text.secondary">
                        {object.address}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Приоритетные направления */}
              {object.priorityDirections?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('object.priority_directions', 'Приоритетные направления')}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {object.priorityDirections.map((direction: any) => (
                      <Chip
                        key={direction.id}
                        label={direction.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Действия */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                {(object.latitude && object.longitude) && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<DirectionsCar />}
                      onClick={() => buildRoute(object)}
                    >
                      {t('object.build_route')}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MapIcon />}
                      onClick={() => openInGoogleMaps(object)}
                    >
                      {t('object.open_in_maps', 'Открыть в картах')}
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShare}
                >
                  {t('object.share')}
                </Button>
              </Stack>
            </Grid>

            {/* Мини-карта */}
            {object.latitude && object.longitude && (
              <Grid item xs={12} md={4}>
                <Card>
                  <ObjectMiniMap
                    position={{ lat: object.latitude, lng: object.longitude }}
                    title={object.name}
                    infrastructureType={object.infrastructureType}
                  />
                </Card>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Вкладки с информацией */}
        {tabs.length > 1 ? (
          <Paper elevation={1}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tabs.map((tab, index) => (
                <TabPanel key={index} value={activeTab} index={index}>
                  {tab.component}
                </TabPanel>
              ))}
            </Box>
          </Paper>
        ) : (
          // Если только одна вкладка, показываем без табов
          <Paper elevation={1} sx={{ p: 3 }}>
            {tabs[0]?.component}
          </Paper>
        )}
      </Container>
    </Box>
  );
}
