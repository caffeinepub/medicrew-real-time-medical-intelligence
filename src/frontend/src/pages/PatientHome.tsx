import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Thermometer, Calendar, Stethoscope, MessageCircle, Wifi } from 'lucide-react';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useGetPatientRecords } from '../hooks/useQueries';
import { isFeatureEnabled } from '../config/features';
import AIHelpDesk from '../components/patient/AIHelpDesk';
import AppointmentBooking from '../components/patient/AppointmentBooking';
import DeviceMonitor from '../components/patient/DeviceMonitor';

export default function PatientHome() {
  const [showHelpDesk, setShowHelpDesk] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [showDeviceMonitor, setShowDeviceMonitor] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);

  const { data: patientRecords } = useGetPatientRecords();

  // Get latest vitals with polling
  const latestVitals = patientRecords?.vitals?.[patientRecords.vitals.length - 1];
  
  const heartRate = useAnimatedCounter(latestVitals ? Number(latestVitals.heartRate) : 72, 1000);
  const spo2 = useAnimatedCounter(latestVitals ? Number(latestVitals.oxygenSaturation) : 98, 1000);
  const temperature = latestVitals ? latestVitals.temperature : 36.8;

  return (
    <main className="flex-1 py-12 px-6">
      <div className="container max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-12 animate-calm-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">MediCrew</h1>
              <p className="text-muted-foreground">Your Health Dashboard</p>
            </div>
          </div>
          
          {isFeatureEnabled('DEVICE_MONITORING') && (
            <Button
              variant={deviceConnected ? 'default' : 'outline'}
              className="rounded-full hover-lift"
              onClick={() => setShowDeviceMonitor(true)}
            >
              <Wifi className={`w-4 h-4 mr-2 ${deviceConnected ? 'animate-soft-pulse' : ''}`} />
              {deviceConnected ? 'Device Connected' : 'Connect Device'}
            </Button>
          )}
        </div>

        {/* Primary Health Status Card */}
        <Card className="card-soft mb-8 animate-calm-fade-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="text-2xl">Current Health Status</CardTitle>
            <CardDescription>Real-time vitals from your connected devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
                <Heart className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-5xl font-semibold mb-2">{heartRate}</div>
                <div className="text-sm text-muted-foreground">Heart Rate (bpm)</div>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/5 to-secondary/10">
                <Activity className="w-10 h-10 text-secondary mx-auto mb-3" />
                <div className="text-5xl font-semibold mb-2">{spo2}</div>
                <div className="text-sm text-muted-foreground">SpO₂ (%)</div>
              </div>
              
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
                <Thermometer className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-5xl font-semibold mb-2">{temperature.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Temperature (°C)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {isFeatureEnabled('APPOINTMENTS') && (
            <Card 
              className="card-soft hover-lift cursor-pointer animate-calm-fade-up" 
              style={{ animationDelay: '0.2s' }}
              onClick={() => setShowAppointmentBooking(true)}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Book Appointment</CardTitle>
                <CardDescription className="text-base">
                  Schedule a consultation with verified doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full rounded-full">
                  Schedule Now
                </Button>
              </CardContent>
            </Card>
          )}

          {isFeatureEnabled('VITALS_TRACKING') && (
            <Card 
              className="card-soft hover-lift cursor-pointer animate-calm-fade-up" 
              style={{ animationDelay: '0.3s' }}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Stethoscope className="w-7 h-7 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Health Analysis</CardTitle>
                <CardDescription className="text-base">
                  View insights and trends from your health data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full rounded-full">
                  View Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Help Desk Button */}
        {isFeatureEnabled('HELP_DESK') && (
          <div className="fixed bottom-8 right-8 z-40 animate-calm-fade-up" style={{ animationDelay: '0.4s' }}>
            <Button
              size="lg"
              className="rounded-full shadow-soft-lg hover-lift w-16 h-16 p-0 animate-soft-pulse"
              onClick={() => setShowHelpDesk(true)}
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showHelpDesk && isFeatureEnabled('HELP_DESK') && (
        <AIHelpDesk onClose={() => setShowHelpDesk(false)} />
      )}
      
      {showAppointmentBooking && isFeatureEnabled('APPOINTMENTS') && (
        <AppointmentBooking onClose={() => setShowAppointmentBooking(false)} />
      )}
      
      {showDeviceMonitor && isFeatureEnabled('DEVICE_MONITORING') && (
        <DeviceMonitor
          onClose={() => setShowDeviceMonitor(false)}
          onConnect={() => setDeviceConnected(true)}
          isConnected={deviceConnected}
        />
      )}
    </main>
  );
}
