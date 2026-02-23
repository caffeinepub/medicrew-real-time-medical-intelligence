import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, UserPlus, Users, Activity } from 'lucide-react';
import NotificationsList from '../components/doctor/NotificationsList';
import AddPatient from '../components/doctor/AddPatient';
import PatientList from '../components/doctor/PatientList';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

export default function DoctorHome() {
  const [activeView, setActiveView] = useState<'home' | 'notifications' | 'addPatient' | 'patientList'>('home');
  
  const totalPatients = useAnimatedCounter(12, 1500);
  const criticalAlerts = useAnimatedCounter(2, 1500);
  const todayAppointments = useAnimatedCounter(5, 1500);

  if (activeView === 'notifications') {
    return <NotificationsList onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'addPatient') {
    return <AddPatient onBack={() => setActiveView('home')} />;
  }

  if (activeView === 'patientList') {
    return <PatientList onBack={() => setActiveView('home')} />;
  }

  return (
    <main className="flex-1 min-h-screen">
      <div className="flex">
        {/* Slim Vertical Navigation */}
        <nav className="w-20 glass-panel border-r border-border/30 min-h-screen flex flex-col items-center py-8 gap-6 fixed left-0 top-0 z-40">
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-2xl hover:bg-primary/20 transition-all duration-300 hover:scale-110"
            onClick={() => setActiveView('notifications')}
          >
            <Bell className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-2xl hover:bg-primary/20 transition-all duration-300 hover:scale-110"
            onClick={() => setActiveView('addPatient')}
          >
            <UserPlus className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-2xl hover:bg-primary/20 transition-all duration-300 hover:scale-110"
            onClick={() => setActiveView('patientList')}
          >
            <Users className="w-6 h-6" />
          </Button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 ml-20 py-8 px-8">
          <div className="container max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 animate-fade-in-up">
              <h1 className="text-5xl font-bold mb-2">Doctor Dashboard</h1>
              <p className="text-lg font-light text-muted-foreground">Mission Control</p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="glass-panel border-2 border-primary/20 glow-primary animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground">Total Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary animate-counter">{totalPatients}</div>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-2 border-critical/30 glow-critical animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground">Critical Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-critical animate-counter">{criticalAlerts}</div>
                </CardContent>
              </Card>
              
              <Card className="glass-panel border-2 border-success/20 glow-success animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground">Today's Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-success animate-counter">{todayAppointments}</div>
                </CardContent>
              </Card>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card 
                className="glass-panel border-2 border-warning/20 hover:border-warning/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:glow-warning animate-fade-in-up"
                onClick={() => setActiveView('notifications')}
                style={{ animationDelay: '0.3s' }}
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center mb-4 glow-warning">
                    <Bell className="w-8 h-8 text-warning" />
                  </div>
                  <CardTitle className="text-2xl">Notifications</CardTitle>
                  <CardDescription className="text-base">
                    View critical patient alerts and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-full bg-warning hover:bg-warning/90 text-warning-foreground">
                    View Alerts
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="glass-panel border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:glow-primary animate-fade-in-up"
                onClick={() => setActiveView('addPatient')}
                style={{ animationDelay: '0.4s' }}
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 glow-primary">
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Add Patient</CardTitle>
                  <CardDescription className="text-base">
                    Register new patients for monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-full">
                    Add New
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="glass-panel border-2 border-success/20 hover:border-success/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:glow-success animate-fade-in-up"
                onClick={() => setActiveView('patientList')}
                style={{ animationDelay: '0.5s' }}
              >
                <CardHeader>
                  <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mb-4 glow-success">
                    <Users className="w-8 h-8 text-success" />
                  </div>
                  <CardTitle className="text-2xl">Patient List</CardTitle>
                  <CardDescription className="text-base">
                    Monitor all patients under your care
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-full bg-success hover:bg-success/90">
                    View All
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
