import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isFeatureEnabled } from '../config/features';
import NotificationsList from '../components/doctor/NotificationsList';
import PatientList from '../components/doctor/PatientList';
import AddPatient from '../components/doctor/AddPatient';
import { Users, Bell, UserPlus, Activity } from 'lucide-react';

type ViewMode = 'dashboard' | 'patients' | 'notifications' | 'add-patient';

export default function DoctorHome() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

  if (viewMode === 'patients') {
    return <PatientList onBack={() => setViewMode('dashboard')} />;
  }

  if (viewMode === 'notifications') {
    return <NotificationsList onBack={() => setViewMode('dashboard')} />;
  }

  if (viewMode === 'add-patient') {
    return <AddPatient onBack={() => setViewMode('dashboard')} />;
  }

  return (
    <div className="flex-1 pt-20">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Monitor patients and manage care</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-soft border-border hover-lift transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Active Patients</CardDescription>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card className="shadow-soft border-border hover-lift transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Critical Alerts</CardDescription>
                <Bell className="w-5 h-5 text-destructive" />
              </div>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card className="shadow-soft border-border hover-lift transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Monitoring</CardDescription>
                <Activity className="w-5 h-5 text-alert-normal" />
              </div>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isFeatureEnabled('DOCTOR_DASHBOARD') && (
            <Card className="shadow-soft border-border hover-lift transition-all duration-200 cursor-pointer" onClick={() => setViewMode('patients')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>Monitor your patients' health status</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover-lift">
                  View Patients
                </Button>
              </CardContent>
            </Card>
          )}

          {isFeatureEnabled('DOCTOR_DASHBOARD') && (
            <Card className="shadow-soft border-border hover-lift transition-all duration-200 cursor-pointer" onClick={() => setViewMode('notifications')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Critical patient alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover-lift">
                  View Alerts
                </Button>
              </CardContent>
            </Card>
          )}

          {isFeatureEnabled('DOCTOR_DASHBOARD') && (
            <Card className="shadow-soft border-border hover-lift transition-all duration-200 cursor-pointer" onClick={() => setViewMode('add-patient')}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-alert-normal/10 flex items-center justify-center mb-3">
                  <UserPlus className="w-6 h-6 text-alert-normal" />
                </div>
                <CardTitle>Add Patient</CardTitle>
                <CardDescription>Start monitoring a new patient</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover-lift">
                  Add Patient
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
