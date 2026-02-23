import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApprovalManagement from '../components/admin/ApprovalManagement';
import FacilityManagement from '../components/admin/FacilityManagement';
import { Users, Building2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approvals');

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and medical facilities</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="approvals" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              <span>User Approvals</span>
            </TabsTrigger>
            <TabsTrigger value="facilities" className="flex items-center gap-2 py-3">
              <Building2 className="w-4 h-4" />
              <span>Medical Facilities</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals">
            <ApprovalManagement />
          </TabsContent>

          <TabsContent value="facilities">
            <FacilityManagement />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

