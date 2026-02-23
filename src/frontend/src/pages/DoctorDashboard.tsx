import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DoctorRegistration from '../components/doctor/DoctorRegistration';
import PatientSearch from '../components/doctor/PatientSearch';
import HospitalLocator from '../components/HospitalLocator';
import ApprovalStatus from '../components/ApprovalStatus';
import { useIsCallerApproved } from '../hooks/useQueries';
import { Users, MapPin, Stethoscope } from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('patients');
  const { data: isApproved, isLoading } = useIsCallerApproved();

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // Show registration form if not approved
  if (!isApproved) {
    return (
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          <DoctorRegistration />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage patient health data</p>
        </div>

        <ApprovalStatus />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="patients" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              <span>Patient Records</span>
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2 py-3">
              <MapPin className="w-4 h-4" />
              <span>Find Hospitals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <PatientSearch />
          </TabsContent>

          <TabsContent value="hospitals">
            <HospitalLocator />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

