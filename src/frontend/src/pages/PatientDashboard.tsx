import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, FileText, TrendingUp, MapPin } from 'lucide-react';
import { isFeatureEnabled } from '../config/features';
import VitalsForm from '../components/patient/VitalsForm';
import SymptomsForm from '../components/patient/SymptomsForm';
import HealthInsights from '../components/patient/HealthInsights';
import HospitalLocator from '../components/HospitalLocator';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('vitals');

  return (
    <main className="flex-1 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8 animate-calm-fade-up">
          <h1 className="text-5xl font-semibold mb-3 tracking-tight">Health Dashboard</h1>
          <p className="text-xl text-muted-foreground">Track your vitals and manage your health</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-full p-1 bg-muted">
            {isFeatureEnabled('VITALS_TRACKING') && (
              <TabsTrigger value="vitals" className="rounded-full">
                <Activity className="w-4 h-4 mr-2" />
                Log Vitals
              </TabsTrigger>
            )}
            {isFeatureEnabled('VITALS_TRACKING') && (
              <TabsTrigger value="symptoms" className="rounded-full">
                <FileText className="w-4 h-4 mr-2" />
                Symptoms
              </TabsTrigger>
            )}
            {isFeatureEnabled('VITALS_TRACKING') && (
              <TabsTrigger value="insights" className="rounded-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            )}
            {isFeatureEnabled('HOSPITAL_LOCATOR') && (
              <TabsTrigger value="hospitals" className="rounded-full">
                <MapPin className="w-4 h-4 mr-2" />
                Hospitals
              </TabsTrigger>
            )}
          </TabsList>

          {isFeatureEnabled('VITALS_TRACKING') && (
            <>
              <TabsContent value="vitals" className="animate-calm-fade-up">
                <Card className="card-soft">
                  <CardHeader>
                    <CardTitle className="text-2xl">Log Your Vitals</CardTitle>
                    <CardDescription>Record your current vital signs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VitalsForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="symptoms" className="animate-calm-fade-up">
                <Card className="card-soft">
                  <CardHeader>
                    <CardTitle className="text-2xl">Log Symptoms</CardTitle>
                    <CardDescription>Record any symptoms you're experiencing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SymptomsForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="animate-calm-fade-up">
                <HealthInsights />
              </TabsContent>
            </>
          )}

          {isFeatureEnabled('HOSPITAL_LOCATOR') && (
            <TabsContent value="hospitals" className="animate-calm-fade-up">
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle className="text-2xl">Find Nearby Hospitals</CardTitle>
                  <CardDescription>Locate medical facilities in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <HospitalLocator />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </main>
  );
}
