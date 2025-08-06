import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем, является ли это админским роутом
  if (pathname.startsWith('/admin')) {
    // Проверяем наличие токена (простая проверка)
    const token = request.cookies.get('accessToken');
    
    if (!token) {
      // Редирект на страницу входа
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
