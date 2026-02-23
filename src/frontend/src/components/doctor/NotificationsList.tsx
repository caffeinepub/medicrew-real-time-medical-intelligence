import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface NotificationsListProps {
  onBack: () => void;
}

export default function NotificationsList({ onBack }: NotificationsListProps) {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      patientName: 'John Doe',
      condition: 'High Blood Pressure',
      urgency: 'Warning',
      time: '5 minutes ago',
      vitals: { bp: '145/95', hr: 88 },
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      condition: 'Low SpO₂',
      urgency: 'Critical',
      time: '15 minutes ago',
      vitals: { spo2: '92%', hr: 95 },
    },
  ];

  return (
    <main className="flex-1 py-8 px-8 ml-20 min-h-screen">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <Button variant="ghost" onClick={onBack} className="mb-4 rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-5xl font-bold mb-2">Patient Notifications</h1>
          <p className="text-lg font-light text-muted-foreground">Critical alerts and updates</p>
        </div>

        <div className="space-y-6">
          {notifications.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No notifications at this time</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification, index) => (
              <Card 
                key={notification.id} 
                className={`glass-panel border-2 animate-fade-in-up ${
                  notification.urgency === 'Critical' 
                    ? 'border-critical animate-critical' 
                    : 'border-warning glow-warning'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">{notification.patientName}</CardTitle>
                      <CardDescription className="text-base">{notification.time}</CardDescription>
                    </div>
                    <Badge 
                      variant={notification.urgency === 'Critical' ? 'destructive' : 'default'}
                      className={`text-base px-4 py-1 ${
                        notification.urgency === 'Warning' ? 'bg-warning text-warning-foreground' : ''
                      }`}
                    >
                      {notification.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-medium text-lg mb-3">{notification.condition}</p>
                    <div className="flex gap-6 text-base">
                      {Object.entries(notification.vitals).map(([key, value]) => (
                        <div key={key} className="glass-card rounded-xl px-4 py-2">
                          <span className="text-muted-foreground">{key.toUpperCase()}: </span>
                          <span className="font-bold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="rounded-full flex-1">View Details</Button>
                    <Button variant="outline" className="rounded-full flex-1">Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
