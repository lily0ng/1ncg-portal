import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation } from
'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from './components/ui/Sonner';
// Layouts
import { Topbar } from './components/layout/Topbar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { UserSidebar } from './components/layout/UserSidebar';
// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminInstancesPage } from './pages/admin/AdminInstancesPage';
import { AdminInstanceDetailPage } from './pages/admin/AdminInstanceDetailPage';
import { AdminVolumesPage } from './pages/admin/AdminVolumesPage';
import { AdminNetworksPage } from './pages/admin/AdminNetworksPage';
import { AdminVPCPage } from './pages/admin/AdminVPCPage';
import { UserInstancesPage } from './pages/user/UserInstancesPage';
import { UserStorePage } from './pages/user/UserStorePage';
import { UserBillingPage } from './pages/user/UserBillingPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
// Stores
import { useAuthStore } from './store/authStore';
import { useThemeStore, applyTheme } from './store/themeStore';
// Page Transition Wrapper
const PageWrapper = ({ children }: {children: React.ReactNode;}) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{
          opacity: 0,
          x: 20
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        exit={{
          opacity: 0,
          x: -20
        }}
        transition={{
          duration: 0.3
        }}
        className="h-full">
        
        {children}
      </motion.div>
    </AnimatePresence>);

};
// Admin Layout
const AdminLayout = ({ children }: {children: React.ReactNode;}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const breadcrumbs = location.pathname.
  split('/').
  filter(Boolean).
  map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar isOpen={sidebarOpen} />
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'sm:ml-64' : 'sm:ml-16'}`}>
        
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={breadcrumbs} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>);

};
// User Layout
const UserLayout = ({ children }: {children: React.ReactNode;}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const breadcrumbs = location.pathname.
  split('/').
  filter(Boolean).
  map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <UserSidebar isOpen={sidebarOpen} />
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'sm:ml-64' : 'sm:ml-16'}`}>
        
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={breadcrumbs} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>);

};
// Protected Route Wrapper
const ProtectedRoute = ({
  children,
  allowedRole



}: {children: React.ReactNode;allowedRole: 'admin' | 'user';}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role !== allowedRole) {
    return (
      <Navigate
        to={user?.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'}
        replace />);


  }
  return <>{children}</>;
};
export function App() {
  const { themeId } = useThemeStore();
  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
          <ProtectedRoute allowedRole="admin">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route
                  path="compute/instances"
                  element={<AdminInstancesPage />} />
                
                  <Route
                  path="compute/instances/:id"
                  element={<AdminInstanceDetailPage />} />
                
                  <Route
                  path="storage/volumes"
                  element={<AdminVolumesPage />} />
                
                  <Route
                  path="network/guest-networks"
                  element={<AdminNetworksPage />} />
                
                  <Route path="network/vpc" element={<AdminVPCPage />} />
                  {/* Catch-all for unimplemented admin routes */}
                  <Route path="*" element={<PlaceholderPage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
        

        {/* User Routes */}
        <Route
          path="/portal/*"
          element={
          <ProtectedRoute allowedRole="user">
              <UserLayout>
                <Routes>
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="instances" element={<UserInstancesPage />} />
                  <Route
                  path="instances/:id"
                  element={<AdminInstanceDetailPage />} />
                
                  <Route path="store" element={<UserStorePage />} />
                  <Route path="billing" element={<UserBillingPage />} />
                  {/* Catch-all for unimplemented user routes */}
                  <Route path="*" element={<PlaceholderPage />} />
                </Routes>
              </UserLayout>
            </ProtectedRoute>
          } />
        
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>);

}