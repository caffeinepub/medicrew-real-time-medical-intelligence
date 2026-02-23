import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Activity, Heart } from 'lucide-react';
import { useGetPatientRecords } from '../../hooks/useQueries';

interface NotificationsListProps {
  onBack: () => void;
}

export default function NotificationsList({ onBack }: NotificationsListProps) {
  // Use high-priority polling (3-5 seconds) for critical patient alerts
  const { data: patientRecords } = useGetPatientRecords();

  // Mock notifications with simulated data
  const notifications = [
    {
      id: 1,
      patient: 'Bob Johnson',
      deviceId: 'MED-2024-003',
      urgency: 'Critical',
      vitals: { hr: 110, spo2: 89, temp: 38.5 },
      message: 'Heart rate elevated, SpO₂ below normal',
      time: '2 minutes ago'
    },
    {
      id: 2,
      patient: 'Jane Smith',
      deviceId: 'MED-2024-002',
      urgency: 'Warning',
      vitals: { hr: 95, spo2: 92, temp: 37.2 },
      message: 'Slight temperature increase detected',
      time: '15 minutes ago'
    },
    {
      id: 3,
      patient: 'Alice Brown',
      deviceId: 'MED-2024-005',
      urgency: 'Warning',
      vitals: { hr: 88, spo2: 94, temp: 37.0 },
      message: 'Blood pressure reading requires attention',
      time: '1 hour ago'
    },
  ];

  const getUrgencyColor = (urgency: string) => {
    return urgency === 'Critical' ? 'alert-critical' : 'alert-warning';
  };

  const getUrgencyGlow = (urgency: string) => {
    return urgency === 'Critical' ? 'glow-soft-critical' : 'glow-soft-warning';
  };

  return (
    <main className="flex-1 py-8 px-8 ml-20 bg-gradient-calm min-h-screen">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-8 animate-calm-fade-up">
          <Button variant="ghost" onClick={onBack} className="mb-4 rounded-full hover-lift">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-5xl font-semibold mb-2 tracking-tight">Critical Alerts</h1>
          <p className="text-lg text-muted-foreground">Urgent patient notifications requiring attention</p>
        </div>

        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card 
              key={notification.id}
              className={`card-soft border-2 border-${getUrgencyColor(notification.urgency)} ${getUrgencyGlow(notification.urgency)} animate-calm-fade-up ${
                notification.urgency === 'Critical' ? 'animate-critical-gentle' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full bg-${getUrgencyColor(notification.urgency)}/10 flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className={`w-6 h-6 text-${getUrgencyColor(notification.urgency)}`} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-1">{notification.patient}</CardTitle>
                      <CardDescription className="text-sm">{notification.deviceId}</CardDescription>
                      <p className="text-base mt-2">{notification.message}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={notification.urgency === 'Critical' ? 'destructive' : 'default'}
                    className={`text-sm px-3 py-1 ${
                      notification.urgency === 'Warning' ? 'bg-alert-warning text-alert-warning-foreground' : ''
                    }`}
                  >
                    {notification.urgency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="card-soft rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Heart Rate</span>
                    </div>
                    <div className="text-xl font-semibold">{notification.vitals.hr} bpm</div>
                  </div>
                  <div className="card-soft rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-secondary" />
                      <span className="text-xs text-muted-foreground">SpO₂</span>
                    </div>
                    <div className="text-xl font-semibold">{notification.vitals.spo2}%</div>
                  </div>
                  <div className="card-soft rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Temp</span>
                    </div>
                    <div className="text-xl font-semibold">{notification.vitals.temp}°C</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{notification.time}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full hover-lift">
                      View Patient
                    </Button>
                    <Button size="sm" className="rounded-full hover-lift">
                      Acknowledge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
