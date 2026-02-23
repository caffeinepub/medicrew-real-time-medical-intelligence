import { Users, Stethoscope, Smartphone, Calendar, Shield, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminSection = 'users' | 'doctors' | 'devices' | 'appointments' | 'admin-management' | 'audit-logs';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  isSuperAdmin: boolean;
}

export default function AdminSidebar({ activeSection, onSectionChange, isSuperAdmin }: AdminSidebarProps) {
  const menuItems = [
    { id: 'users' as AdminSection, label: 'Users', icon: Users, visible: true },
    { id: 'doctors' as AdminSection, label: 'Doctors', icon: Stethoscope, visible: true },
    { id: 'devices' as AdminSection, label: 'Devices', icon: Smartphone, visible: true },
    { id: 'appointments' as AdminSection, label: 'Appointments', icon: Calendar, visible: true },
    { id: 'admin-management' as AdminSection, label: 'Admin Management', icon: Shield, visible: isSuperAdmin },
    { id: 'audit-logs' as AdminSection, label: 'Audit Logs', icon: FileText, visible: isSuperAdmin },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">Admin Dashboard</h2>
        
        <nav className="space-y-2">
          {menuItems.filter(item => item.visible).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  'hover:bg-primary/5 hover:translate-x-1',
                  isActive && 'bg-primary/10 text-primary shadow-sm'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                <span className={cn(
                  'font-medium',
                  isActive ? 'text-primary' : 'text-foreground'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
