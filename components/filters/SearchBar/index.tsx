import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearch } from '@/store/slices/filtersSlice';
import { useDebounce } from '@/hooks/useDebounce';

export const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector(state => state.filters.search);
  const [localSearch, setLocalSearch] = useState(search);
  
  // Дебаунс для оптимизации
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    dispatch(setSearch(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleClear = () => {
    setLocalSearch('');
    dispatch(setSearch(''));
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={localSearch}
        onChange={handleChange}
        placeholder="Поиск объектов..."
        className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {/* Иконка поиска */}
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM13.5 13.5L18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Кнопка очистки */}
      {localSearch && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M6 6l8 8M14 6l-8 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};