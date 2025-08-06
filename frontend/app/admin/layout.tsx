'use client';

import { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuth } from '@/lib/hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  useAuth({ allowedRoles: ['SUPER_ADMIN', 'EDITOR'] });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
        <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
          <Container maxWidth="xl">
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
