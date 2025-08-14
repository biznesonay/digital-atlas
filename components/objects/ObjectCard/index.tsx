import React from 'react';
import { InfrastructureObject } from '@/types';

interface ObjectCardProps {
  object: InfrastructureObject;
  onClick?: () => void;
}

export const ObjectCard: React.FC<ObjectCardProps> = ({ object, onClick }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Заголовок с типом */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-800 flex-1">
          {object.name}
        </h3>
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: object.type.color }}
          title={object.type.name}
        />
      </div>

      {/* Тип инфраструктуры */}
      <p className="text-sm text-gray-600 mb-2">
        <span className="font-medium">{object.type.icon}</span> {object.type.name}
      </p>

      {/* Адрес */}
      <p className="text-sm text-gray-600 mb-2">
        📍 {object.address}
      </p>

      {/* Регион */}
      <p className="text-sm text-gray-600 mb-3">
        🗺️ {object.region.name}
      </p>

      {/* Приоритетные направления */}
      {object.priorityDirections.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {object.priorityDirections.slice(0, 3).map(dir => (
            <span
              key={dir.id}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              {dir.name}
            </span>
          ))}
          {object.priorityDirections.length > 3 && (
            <span className="text-xs text-gray-500 px-2 py-1">
              +{object.priorityDirections.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Контакты */}
      <div className="flex items-center justify-between text-sm">
        {object.contactPhones && (
          <span className="text-gray-600">
            📞 {object.contactPhones.split(',')[0]}
          </span>
        )}
        {object.website && (
          
            href={object.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Веб-сайт →
          </a>
        )}
      </div>
    </div>
  );
};