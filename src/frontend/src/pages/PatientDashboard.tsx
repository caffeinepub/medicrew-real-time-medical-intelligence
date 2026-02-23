import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VitalsForm from '../components/patient/VitalsForm';
import SymptomsForm from '../components/patient/SymptomsForm';
import HealthRecords from '../components/patient/HealthRecords';
import HealthInsights from '../components/patient/HealthInsights';
import HospitalLocator from '../components/HospitalLocator';
import ApprovalStatus from '../components/ApprovalStatus';
import { Activity, FileText, Brain, MapPin } from 'lucide-react';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('vitals');

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Dashboard</h1>
          <p className="text-muted-foreground">Track your health data and get personalized insights</p>
        </div>

        <ApprovalStatus />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="vitals" className="flex items-center gap-2 py-3">
              <Activity className="w-4 h-4" />
              <span>Log Vitals</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="flex items-center gap-2 py-3">
              <FileText className="w-4 h-4" />
              <span>Log Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 py-3">
              <Brain className="w-4 h-4" />
              <span>Health Insights</span>
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2 py-3">
              <MapPin className="w-4 h-4" />
              <span>Find Hospitals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vitals" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <VitalsForm />
              <HealthRecords type="vitals" />
            </div>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <SymptomsForm />
              <HealthRecords type="symptoms" />
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <HealthInsights />
          </TabsContent>

          <TabsContent value="hospitals">
            <HospitalLocator />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

