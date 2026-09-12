import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserDataProvider } from './context/UserDataContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { SmartPortalLayout } from './layouts/SmartPortalLayout';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { DashboardPage } from './pages/DashboardPage';
import { CareerExplorerPage } from './pages/CareerExplorerPage';
import { CareerDetailPage } from './pages/CareerDetailPage';
import { SavedCareersPage } from './pages/SavedCareersPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <UserDataProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Landing & Marketing (MainLayout with Navbar & Footer) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Smart Portal Routes (AppShell when logged in, MainLayout when public) */}
            <Route element={<SmartPortalLayout />}>
              <Route path="/careers" element={<CareerExplorerPage />} />
              <Route path="/careers/:id" element={<CareerDetailPage />} />
            </Route>

            {/* Authenticated Student Portal Routes (AppShell with Sidebar & Topbar) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/saved-careers" element={<SavedCareersPage />} />
              <Route path="/saved" element={<Navigate to="/saved-careers" replace />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resume" element={<ProfilePage initialTab="resume" />} />
              <Route path="/settings" element={<Navigate to="/profile" replace />} />
            </Route>

            {/* 404 Not Found Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </UserDataProvider>
    </AuthProvider>
  );
};

export default App;
