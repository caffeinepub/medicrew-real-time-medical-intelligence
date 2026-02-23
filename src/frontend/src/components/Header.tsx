import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserRole } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { Heart, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UserRole } from '../backend';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: roleInfo } = useGetUserRole();
  const queryClient = useQueryClient();
  const scrollDirection = useScrollDirection();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const text = loginStatus === 'logging-in' ? 'Connecting...' : isAuthenticated ? 'Logout' : 'Login';

  // Calculate time remaining for temporary admins
  useEffect(() => {
    if (!roleInfo || !roleInfo.expiresAt) {
      setTimeRemaining('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now() * 1000000; // Convert to nanoseconds
      const remaining = Number(roleInfo.expiresAt) - now;
      
      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(remaining / (24 * 60 * 60 * 1000000000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000000000)) / (60 * 60 * 1000000000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000000000)) / (60 * 1000000000));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [roleInfo]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.patient:
        return 'bg-primary/10 text-primary border-primary';
      case UserRole.doctor:
        return 'bg-alert-normal/10 text-alert-normal border-alert-normal';
      case UserRole.admin:
        return 'bg-purple-500/10 text-purple-600 border-purple-500';
      case UserRole.superAdmin:
        return 'bg-amber-500/10 text-amber-600 border-amber-500';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.patient:
        return 'Patient';
      case UserRole.doctor:
        return 'Doctor';
      case UserRole.admin:
        return 'Admin';
      case UserRole.superAdmin:
        return 'SuperAdmin';
      default:
        return 'Guest';
    }
  };

  const daysRemaining = roleInfo?.expiresAt 
    ? Math.ceil((Number(roleInfo.expiresAt) - Date.now() * 1000000) / (24 * 60 * 60 * 1000000000))
    : 0;
  const isExpiringSoon = daysRemaining > 0 && daysRemaining < 3;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="glass-light border-b border-border">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-semibold tracking-tight">MediCrew</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated && roleInfo && (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`${getRoleBadgeColor(roleInfo.role)} shadow-sm`}
                  >
                    {getRoleLabel(roleInfo.role)}
                  </Badge>
                  
                  {roleInfo.expiresAt && roleInfo.role === UserRole.admin && (
                    <Badge 
                      variant="outline" 
                      className={`${
                        isExpiringSoon 
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500 animate-soft-pulse' 
                          : 'bg-muted text-muted-foreground border-border'
                      } shadow-sm`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Expires in {timeRemaining}
                    </Badge>
                  )}
                </div>
              )}
              
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? 'outline' : 'default'}
                className="rounded-full px-6 transition-all duration-400 hover-lift"
              >
                {text}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
