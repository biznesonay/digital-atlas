import React from 'react';
import { Logo } from '../Logo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { APP_COLORS } from '@/constants/colors';

export const Header: React.FC = () => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 h-16 z-30 shadow-md"
      style={{ backgroundColor: APP_COLORS.header }}
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Логотип */}
        <Logo />

        {/* Правая часть */}
        <div className="flex items-center gap-4">
          {/* Переключатель языков */}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};