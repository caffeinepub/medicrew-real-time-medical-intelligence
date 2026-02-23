import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isFeatureEnabled } from '../config/features';
import PatientSearch from '../components/doctor/PatientSearch';
import HospitalLocator from '../components/HospitalLocator';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="flex-1 pt-20">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Access patient records and medical facilities</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            {isFeatureEnabled('DOCTOR_DASHBOARD') && (
              <TabsTrigger value="search">Patient Records</TabsTrigger>
            )}
            {isFeatureEnabled('HOSPITAL_LOCATOR') && (
              <TabsTrigger value="locator">Hospital Locator</TabsTrigger>
            )}
          </TabsList>

          {isFeatureEnabled('DOCTOR_DASHBOARD') && (
            <TabsContent value="search" className="space-y-6">
              <PatientSearch />
            </TabsContent>
          )}

          {isFeatureEnabled('HOSPITAL_LOCATOR') && (
            <TabsContent value="locator" className="space-y-6">
              <HospitalLocator />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
