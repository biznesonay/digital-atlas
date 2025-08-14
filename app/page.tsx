'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { MapContainer } from '@/components/map/MapContainer';
import { FilterPanel } from '@/components/filters/FilterPanel';
import { ObjectsListButton } from '@/components/objects/ObjectsListButton';
import { ObjectsListModal } from '@/components/objects/ObjectsListModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchObjects } from '@/store/slices/objectsSlice';
import { setCenter, setZoom } from '@/store/slices/mapSlice';
import axios from 'axios';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { isListModalOpen, language } = useAppSelector(state => state.ui);
  const { loading } = useAppSelector(state => state.objects);
  const [infrastructureTypes, setInfrastructureTypes] = React.useState([]);
  const [regions, setRegions] = React.useState([]);
  const [priorityDirections, setPriorityDirections] = React.useState([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);

  // Загрузка справочников и объектов
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsDataLoading(true);

        // Загружаем справочники параллельно
        const [typesRes, regionsRes, directionsRes] = await Promise.all([
          axios.get(`/api/infrastructure-types?lang=${language}`),
          axios.get(`/api/regions?lang=${language}`),
          axios.get('/api/priority-directions'),
        ]);

        setInfrastructureTypes(typesRes.data.data);
        setRegions(regionsRes.data.data);
        setPriorityDirections(directionsRes.data.data);

        // Загружаем объекты
        await dispatch(fetchObjects({ lang: language }));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [dispatch, language]);

  // Обработка выбора объекта из списка
  const handleSelectObject = (object: any) => {
    if (object.coordinates?.latitude && object.coordinates?.longitude) {
      dispatch(setCenter({
        lat: object.coordinates.latitude,
        lng: object.coordinates.longitude,
      }));
      dispatch(setZoom(16));
    }
  };

  // Показываем загрузку при первой загрузке
  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Загрузка карты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Хедер */}
      <Header />

      {/* Карта */}
      <div className="pt-16 h-full">
        <MapContainer infrastructureTypes={infrastructureTypes} />
      </div>

      {/* Панель фильтров */}
      <FilterPanel
        infrastructureTypes={infrastructureTypes}
        regions={regions}
        priorityDirections={priorityDirections}
      />

      {/* Кнопка списка объектов */}
      <ObjectsListButton />

      {/* Модальное окно списка */}
      <ObjectsListModal
        isOpen={isListModalOpen}
        onClose={() => dispatch(toggleListModal())}
        onSelectObject={handleSelectObject}
      />
    </div>
  );
}