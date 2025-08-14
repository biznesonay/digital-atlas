import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage } from '@/store/slices/uiSlice';
import { LanguageCode } from '@/types';

const languages = [
  { code: 'ru' as LanguageCode, name: 'Русский', flag: '🇷🇺' },
  { code: 'kz' as LanguageCode, name: 'Қазақша', flag: '🇰🇿' },
  { code: 'en' as LanguageCode, name: 'English', flag: '🇬🇧' },
];

export const LanguageSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector(state => state.ui.language);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  useEffect(() => {
    // Закрытие при клике вне компонента
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: LanguageCode) => {
    dispatch(setLanguage(code));
    setIsOpen(false);
    // Здесь можно добавить логику для смены языка через i18next
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <span className="text-xl">{currentLang.flag}</span>
        <span className="hidden sm:block">{currentLang.code.toUpperCase()}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M3 4.5l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors
                ${lang.code === currentLanguage ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
              `}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};