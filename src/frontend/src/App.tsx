import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserRole, useIsCallerAdmin, useGetDoctorProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PatientHome from './pages/PatientHome';
import DoctorHome from './pages/DoctorHome';
import AdminDashboard from './pages/AdminDashboard';
import RoleSelection from './components/RoleSelection';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: isAdmin } = useIsCallerAdmin();
  const getDoctorProfile = useGetDoctorProfile();
  const [isDoctorRegistered, setIsDoctorRegistered] = useState(false);
  const [checkingDoctor, setCheckingDoctor] = useState(false);

  const isAuthenticated = !!identity;

  // Check if user is a registered doctor
  useEffect(() => {
    if (isAuthenticated && identity && userRole === 'user' && !isAdmin) {
      setCheckingDoctor(true);
      getDoctorProfile.mutate(identity.getPrincipal(), {
        onSuccess: () => {
          setIsDoctorRegistered(true);
          setCheckingDoctor(false);
        },
        onError: () => {
          setIsDoctorRegistered(false);
          setCheckingDoctor(false);
        },
      });
    }
  }, [isAuthenticated, identity, userRole, isAdmin]);

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
  if (roleLoading || checkingDoctor) {
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

  // Show role selection for guest users
  if (userRole === 'guest') {
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

  // Route based on user role
  const renderDashboard = () => {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    
    if (isDoctorRegistered) {
      return <DoctorHome />;
    }
    
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
