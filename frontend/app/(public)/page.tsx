'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchReferences } from '@/store/slices/referencesSlice';
import { fetchObjects } from '@/store/slices/objectsSlice';
import { selectLanguage, selectIsObjectsListOpen, toggleObjectsList } from '@/store/slices/uiSlice';
import Header from '@/components/common/Header';
import FilterPanel from '@/components/filters/FilterPanel';
import FloatingButton from '@/components/ui/FloatingButton';
import ObjectsListModal from '@/components/objects/ObjectsListModal';

// Динамический импорт карты для избежания SSR проблем
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { ssr: false }
);

export default function HomePage() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(selectLanguage);
  const isObjectsListOpen = useAppSelector(selectIsObjectsListOpen);

  // Загружаем справочники и объекты при монтировании
  useEffect(() => {
    dispatch(fetchReferences(language));
    dispatch(fetchObjects({ lang: language }));
  }, [dispatch, language]);

  const handleToggleObjectsList = () => {
    dispatch(toggleObjectsList());
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        <InteractiveMap />
        <FilterPanel />
        <FloatingButton onClick={handleToggleObjectsList} />
        <ObjectsListModal
          open={isObjectsListOpen}
          onClose={() => dispatch(toggleObjectsList())}
        />
      </Box>
    </Box>
  );
}