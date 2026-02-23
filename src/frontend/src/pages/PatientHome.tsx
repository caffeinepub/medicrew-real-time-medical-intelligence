import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, Activity, Heart, Thermometer, Droplet } from 'lucide-react';
import AIHelpDesk from '../components/patient/AIHelpDesk';
import AppointmentBooking from '../components/patient/AppointmentBooking';
import DeviceMonitor from '../components/patient/DeviceMonitor';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

export default function PatientHome() {
  const [showHelpDesk, setShowHelpDesk] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showDeviceMonitor, setShowDeviceMonitor] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  
  const heartRate = useAnimatedCounter(72, 1500);
  const spo2 = useAnimatedCounter(98, 1500);
  const temp = useAnimatedCounter(368, 1500);

  const handleDeviceConnect = () => {
    setIsDeviceConnected(true);
  };

  return (
    <main className="flex-1 min-h-screen py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-5xl font-bold">Patient Dashboard</h1>
              <p className="text-lg font-light text-muted-foreground">Your health at a glance</p>
            </div>
          </div>
        </div>

        {/* Health Status Card - Large Animated */}
        <div className="mb-12 animate-scale-in">
          <Card className="glass-panel border-2 border-primary/30 glow-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">Health Status</CardTitle>
                  <CardDescription className="text-base">Real-time vitals monitoring</CardDescription>
                </div>
                <Button
                  onClick={() => setShowDeviceMonitor(true)}
                  variant="outline"
                  className="rounded-full"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Connect Device
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Heart className="w-8 h-8 text-chart-1 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-chart-1 mb-1 animate-counter">{heartRate}</div>
                  <div className="text-sm text-muted-foreground">Heart Rate (bpm)</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Activity className="w-8 h-8 text-chart-3 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-chart-3 mb-1 animate-counter">{spo2}%</div>
                  <div className="text-sm text-muted-foreground">Blood Oxygen</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Thermometer className="w-8 h-8 text-chart-4 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-chart-4 mb-1 animate-counter">{(temp / 10).toFixed(1)}°C</div>
                  <div className="text-sm text-muted-foreground">Temperature</div>
                </div>
                <div className="glass-card rounded-2xl p-6 text-center">
                  <Droplet className="w-8 h-8 text-chart-2 mx-auto mb-3" />
                  <div className="text-4xl font-bold text-chart-2 mb-1 animate-counter">120/80</div>
                  <div className="text-sm text-muted-foreground">Blood Pressure</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panels - Floating */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card 
            className="glass-panel border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:glow-primary animate-fade-in-up"
            onClick={() => setShowBooking(true)}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 glow-primary">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Book Appointment</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Schedule a consultation with verified doctors in your area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full rounded-full" size="lg">
                Find Doctors
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="glass-panel border-2 border-success/20 hover:border-success/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:glow-success animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mb-4 glow-success">
                <Sparkles className="w-8 h-8 text-success" />
              </div>
              <CardTitle className="text-3xl">Health Analysis</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Get instant AI-powered analysis of your symptoms and vitals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full rounded-full bg-success hover:bg-success/90" size="lg">
                View Insights
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Glowing Help Desk Button - Bottom Right */}
        <Button
          onClick={() => setShowHelpDesk(true)}
          size="lg"
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-glow-lg animate-pulse-glow z-40 p-0"
        >
          <Sparkles className="w-8 h-8" />
        </Button>
      </div>

      {/* Modals */}
      {showHelpDesk && <AIHelpDesk onClose={() => setShowHelpDesk(false)} />}
      {showBooking && <AppointmentBooking onClose={() => setShowBooking(false)} />}
      {showDeviceMonitor && (
        <DeviceMonitor 
          onClose={() => setShowDeviceMonitor(false)} 
          onConnect={handleDeviceConnect}
          isConnected={isDeviceConnected}
        />
      )}
    </main>
  );
}
