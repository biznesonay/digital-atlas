import React from 'react';
import Link from 'next/link';

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        className="text-white"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
        <path
          d="M16 8c-4 0-7 3-7 7s7 9 7 9 7-5 7-9-3-7-7-7z"
          fill="currentColor"
        />
        <circle cx="16" cy="15" r="2" fill="#1c296a"/>
      </svg>
      <span className="text-white font-semibold text-lg hidden md:block">
        Цифровой атлас
      </span>
    </Link>
  );
};