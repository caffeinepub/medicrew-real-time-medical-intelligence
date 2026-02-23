import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Activity } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { useGetPatientRecords } from '../../hooks/useQueries';

interface PatientListProps {
  onBack: () => void;
}

export default function PatientList({ onBack }: PatientListProps) {
  // Use high-priority polling (3-5 seconds) for patient vitals
  const { data: patientRecords } = useGetPatientRecords();

  // Mock patient data with simulated vitals
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
      case 'Critical': return 'alert-critical';
      case 'Warning': return 'alert-warning';
      default: return 'alert-normal';
    }
  };

  const getStatusGlow = (status: string) => {
    switch (status) {
      case 'Critical': return 'glow-soft-critical';
      case 'Warning': return 'glow-soft-warning';
      default: return 'glow-soft-normal';
    }
  };

  return (
    <main className="flex-1 py-8 px-8 ml-20 bg-gradient-calm min-h-screen">
      <div className="container max-w-7xl mx-auto">
        <div className="mb-8 animate-calm-fade-up">
          <Button variant="ghost" onClick={onBack} className="mb-4 rounded-full hover-lift">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-5xl font-semibold mb-2 tracking-tight">Patient List</h1>
          <p className="text-lg text-muted-foreground">Monitor all patients under your care</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient, index) => (
            <Card
              key={patient.id}
              className={`card-soft border-2 border-${getStatusColor(patient.status)} ${getStatusGlow(patient.status)} animate-calm-fade-up ${
                patient.status === 'Critical' ? 'animate-critical-gentle' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-xl mb-1">{patient.name}</CardTitle>
                    <CardDescription className="text-xs">{patient.deviceId}</CardDescription>
                  </div>
                  <Badge
                    variant={patient.status === 'Critical' ? 'destructive' : patient.status === 'Warning' ? 'default' : 'outline'}
                    className={`text-xs ${
                      patient.status === 'Warning' ? 'bg-alert-warning text-alert-warning-foreground' : 
                      patient.status === 'Normal' ? 'bg-alert-normal/10 text-alert-normal border-alert-normal/20' : ''
                    }`}
                  >
                    {patient.status}
                  </Badge>
                </div>

                {/* Mini Trend Chart */}
                <div className="h-16 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patient.trend.map((value, i) => ({ value, index: i }))}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={`hsl(var(--${getStatusColor(patient.status)}))`}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="card-soft rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Heart Rate</div>
                    <div className="text-lg font-semibold">{patient.vitals.hr} bpm</div>
                  </div>
                  <div className="card-soft rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">SpO₂</div>
                    <div className="text-lg font-semibold">{patient.vitals.spo2}%</div>
                  </div>
                  <div className="card-soft rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Temp</div>
                    <div className="text-lg font-semibold">{patient.vitals.temp}°C</div>
                  </div>
                  <div className="card-soft rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">BP</div>
                    <div className="text-lg font-semibold">{patient.vitals.bp}</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-full hover-lift" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
