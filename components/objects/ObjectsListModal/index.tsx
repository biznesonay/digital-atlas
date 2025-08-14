import React, { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ObjectCard } from '../ObjectCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAppSelector } from '@/store/hooks';
import { InfrastructureObject } from '@/types';

interface ObjectsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject?: (object: InfrastructureObject) => void;
}

export const ObjectsListModal: React.FC<ObjectsListModalProps> = ({
  isOpen,
  onClose,
  onSelectObject,
}) => {
  const { items: objects, loading } = useAppSelector(state => state.objects);
  const filters = useAppSelector(state => state.filters);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'region'>('name');

  // Фильтрация объектов
  const filteredObjects = useMemo(() => {
    let filtered = [...objects];

    // Фильтр по поиску
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(obj =>
        obj.name.toLowerCase().includes(searchLower) ||
        obj.address.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по типам
    if (filters.infrastructureTypes.length > 0) {
      filtered = filtered.filter(obj =>
        filters.infrastructureTypes.includes(obj.type.id)
      );
    }

    // Фильтр по регионам
    if (filters.regions.length > 0) {
      filtered = filtered.filter(obj =>
        filters.regions.includes(obj.region.id)
      );
    }

    // Фильтр по направлениям
    if (filters.priorityDirections.length > 0) {
      filtered = filtered.filter(obj =>
        obj.priorityDirections.some(dir =>
          filters.priorityDirections.includes(dir.id)
        )
      );
    }

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.name.localeCompare(b.type.name);
        case 'region':
          return a.region.name.localeCompare(b.region.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [objects, filters, sortBy]);

  const handleObjectClick = (object: InfrastructureObject) => {
    onSelectObject?.(object);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Список объектов инфраструктуры"
      maxWidth="max-w-4xl"
    >
      {/* Панель с информацией и сортировкой */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          Найдено объектов: <span className="font-semibold">{filteredObjects.length}</span>
        </p>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'region')}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">По названию</option>
          <option value="type">По типу</option>
          <option value="region">По региону</option>
        </select>
      </div>

      {/* Список объектов */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredObjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredObjects.map(object => (
            <ObjectCard
              key={object.id}
              object={object}
              onClick={() => handleObjectClick(object)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Объекты не найдены</p>
          <p className="text-sm text-gray-400 mt-2">
            Попробуйте изменить параметры фильтрации
          </p>
        </div>
      )}
    </Modal>
  );
};