import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppShell } from '../components/AppShell';
import { MainLayout } from './MainLayout';

/**
 * Renders AppShell with Sidebar + Topbar when user is logged in,
 * or MainLayout with public Navbar + Footer when visiting publicly.
 */
export const SmartPortalLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppShell /> : <MainLayout />;
};
