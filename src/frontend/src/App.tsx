import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetUserRole, useGetCallerUserProfile } from './hooks/useQueries';
import { isFeatureEnabled } from './config/features';
import { useAdminShortcut } from './hooks/useAdminShortcut';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PatientHome from './pages/PatientHome';
import DoctorHome from './pages/DoctorHome';
import AdminDashboard from './pages/AdminDashboard';
import RoleSelection from './components/RoleSelection';
import ProfileSetup from './components/ProfileSetup';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserRole } from './backend';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: roleInfo, isLoading: roleLoading } = useGetUserRole();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [previousRole, setPreviousRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<'default' | 'admin'>('default');

  const isAuthenticated = !!identity;
  const isInsideApp = isAuthenticated && !profileLoading && isFetched && userProfile !== null;

  // Wire the admin shortcut hook with navigation handler
  useAdminShortcut({ 
    isAuthenticated, 
    isInsideApp,
    onNavigate: () => setCurrentView('admin')
  });

  // Monitor role changes and detect expiration
  useEffect(() => {
    if (roleInfo && previousRole && roleInfo.role !== previousRole) {
      // Role changed - check if it was due to expiration
      if (previousRole === UserRole.admin && roleInfo.role !== UserRole.admin && roleInfo.role !== UserRole.superAdmin) {
        toast.error('Admin access expired. Redirecting...', {
          duration: 3000,
        });
        setCurrentView('default');
      }
    }
    if (roleInfo) {
      setPreviousRole(roleInfo.role);
    }
  }, [roleInfo, previousRole]);

  // Reset to default view when user logs out or role changes to non-admin
  useEffect(() => {
    if (!isAuthenticated || (roleInfo && roleInfo.role !== UserRole.admin && roleInfo.role !== UserRole.superAdmin)) {
      if (currentView === 'admin') {
        setCurrentView('default');
      }
    }
  }, [isAuthenticated, roleInfo, currentView]);

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex flex-col">
          <Header />
          <LandingPage />
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show loading state while role is being fetched
  if (roleLoading || profileLoading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading MediCrew...</p>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show profile setup if user doesn't have a profile yet
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex flex-col">
          <Header />
          <ProfileSetup />
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Show role selection for guest users (if needed)
  if (!roleInfo || !userProfile) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen flex flex-col">
          <Header />
          <RoleSelection />
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    );
  }

  // Route based on current view and user role
  const renderDashboard = () => {
    // If admin view is requested, show admin dashboard
    if (currentView === 'admin') {
      return <AdminDashboard onNavigateBack={() => setCurrentView('default')} />;
    }

    // Default view: route based on user role
    if ((roleInfo.role === UserRole.admin || roleInfo.role === UserRole.superAdmin) && isFeatureEnabled('ADMIN_PANEL')) {
      return <AdminDashboard onNavigateBack={() => setCurrentView('default')} />;
    }
    
    // Doctors go to doctor dashboard
    if (roleInfo.role === UserRole.doctor && isFeatureEnabled('DOCTOR_DASHBOARD')) {
      return <DoctorHome />;
    }
    
    // Patients go to patient dashboard
    return <PatientHome />;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Header />
        {renderDashboard()}
        <Footer />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
