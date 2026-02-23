import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

interface PatientListProps {
  onBack: () => void;
}

export default function PatientList({ onBack }: PatientListProps) {
  // Mock patient data
  const patients = [
    {
      id: 1,
      name: 'John Doe',
      deviceId: 'MED-2024-001',
      status: 'Normal',
      vitals: { hr: 72, spo2: 98, temp: 36.8, bp: '120/80' },
      trend: [65, 68, 70, 72, 71, 72, 73]
    },
    {
      id: 2,
      name: 'Jane Smith',
      deviceId: 'MED-2024-002',
      status: 'Warning',
      vitals: { hr: 95, spo2: 92, temp: 37.2, bp: '135/85' },
      trend: [85, 88, 90, 92, 94, 95, 96]
    },
    {
      id: 3,
      name: 'Bob Johnson',
      deviceId: 'MED-2024-003',
      status: 'Critical',
      vitals: { hr: 110, spo2: 89, temp: 38.5, bp: '150/95' },
      trend: [95, 100, 105, 108, 110, 112, 110]
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'critical';
      case 'Warning': return 'warning';
      default: return 'success';
    }
  };

  return (
    <main className="flex-1 py-8 px-8 ml-20">
      <div className="container max-w-7xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <Button variant="ghost" onClick={onBack} className="mb-4 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-5xl font-bold mb-2">Patient List</h1>
          <p className="text-lg font-light text-muted-foreground">Monitor all patients under your care</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.length === 0 ? (
            <Card className="glass-card col-span-full">
              <CardContent className="pt-12 pb-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No patients added yet</p>
              </CardContent>
            </Card>
          ) : (
            patients.map((patient, index) => (
              <Card 
                key={patient.id} 
                className={`glass-panel border-2 hover:shadow-glow-lg transition-all duration-500 hover:scale-105 animate-fade-in-up ${
                  patient.status === 'Critical' ? 'border-critical animate-critical' : 
                  patient.status === 'Warning' ? 'border-warning glow-warning' : 
                  'border-success/30 glow-success'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
                      <span className="text-xl font-bold text-primary">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <Badge 
                      variant={patient.status === 'Critical' ? 'destructive' : 'default'}
                      className={`text-sm px-3 py-1 ${
                        patient.status === 'Warning' ? 'bg-warning text-warning-foreground' : 
                        patient.status === 'Normal' ? 'bg-success text-success-foreground' : ''
                      }`}
                    >
                      {patient.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{patient.name}</CardTitle>
                  <CardDescription className="text-xs">{patient.deviceId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mini Chart */}
                  <div className="h-16 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={patient.trend.map((value, i) => ({ value }))}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={
                            patient.status === 'Critical' ? 'oklch(var(--critical))' :
                            patient.status === 'Warning' ? 'oklch(var(--warning))' :
                            'oklch(var(--success))'
                          }
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="glass-card rounded-xl p-3">
                      <span className="text-muted-foreground block mb-1">HR</span>
                      <span className="font-bold text-lg animate-counter">{patient.vitals.hr} bpm</span>
                    </div>
                    <div className="glass-card rounded-xl p-3">
                      <span className="text-muted-foreground block mb-1">SpO₂</span>
                      <span className="font-bold text-lg animate-counter">{patient.vitals.spo2}%</span>
                    </div>
                    <div className="glass-card rounded-xl p-3">
                      <span className="text-muted-foreground block mb-1">Temp</span>
                      <span className="font-bold text-lg animate-counter">{patient.vitals.temp}°C</span>
                    </div>
                    <div className="glass-card rounded-xl p-3">
                      <span className="text-muted-foreground block mb-1">BP</span>
                      <span className="font-bold text-lg">{patient.vitals.bp}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full rounded-full" size="sm">
                    <Activity className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
