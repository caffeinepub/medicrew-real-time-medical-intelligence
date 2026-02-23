import { useState, useEffect } from 'react';
import { useGetUserRole } from '../hooks/useQueries';
import { UserRole } from '../backend';
import AdminSidebar from '../components/admin/AdminSidebar';
import UsersManagement from '../components/admin/UsersManagement';
import DoctorsManagement from '../components/admin/DoctorsManagement';
import DevicesManagement from '../components/admin/DevicesManagement';
import AppointmentsManagement from '../components/admin/AppointmentsManagement';
import AdminManagement from '../components/admin/AdminManagement';
import AuditLogsManagement from '../components/admin/AuditLogsManagement';
import { toast } from 'sonner';

type AdminSection = 'users' | 'doctors' | 'devices' | 'appointments' | 'admin-management' | 'audit-logs';

interface AdminDashboardProps {
  onNavigateBack?: () => void;
}

export default function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const { data: roleInfo, isLoading } = useGetUserRole();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [accessDenied, setAccessDenied] = useState(false);

  // Route protection - backend validates role, frontend handles UX
  useEffect(() => {
    if (!isLoading && roleInfo) {
      if (roleInfo.role !== UserRole.admin && roleInfo.role !== UserRole.superAdmin) {
        setAccessDenied(true);
        
        // Show destructive toast for unauthorized access
        toast.error('Access Denied.', { 
          duration: 2000,
          className: 'bg-destructive text-destructive-foreground border-destructive',
        });
        
        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          if (onNavigateBack) {
            onNavigateBack();
          }
        }, 2000);
      }
    }
  }, [roleInfo, isLoading, onNavigateBack]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the Admin Dashboard.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'doctors':
        return <DoctorsManagement />;
      case 'devices':
        return <DevicesManagement />;
      case 'appointments':
        return <AppointmentsManagement />;
      case 'admin-management':
        return roleInfo?.role === UserRole.superAdmin ? <AdminManagement /> : null;
      case 'audit-logs':
        return roleInfo?.role === UserRole.superAdmin ? <AuditLogsManagement /> : null;
      default:
        return <UsersManagement />;
    }
  };

  return (
    <div className="flex-1 flex pt-20">
      <AdminSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        isSuperAdmin={roleInfo?.role === UserRole.superAdmin}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
