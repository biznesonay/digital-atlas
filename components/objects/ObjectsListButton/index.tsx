import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleListModal } from '@/store/slices/uiSlice';

export const ObjectsListButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const objectsCount = useAppSelector(state => state.objects.items.length);

  const handleClick = () => {
    dispatch(toggleListModal());
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 z-20"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 5h14M3 10h14M3 15h14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>Список объектов</span>
      {objectsCount > 0 && (
        <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-semibold">
          {objectsCount}
        </span>
      )}
    </button>
  );
};