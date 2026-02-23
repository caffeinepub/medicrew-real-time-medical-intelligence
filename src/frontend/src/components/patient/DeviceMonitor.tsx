import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Activity, Heart, Thermometer, Droplet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DeviceMonitorProps {
  onClose: () => void;
  onConnect: () => void;
  isConnected: boolean;
}

export default function DeviceMonitor({ onClose, onConnect, isConnected }: DeviceMonitorProps) {
  const [deviceId, setDeviceId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [vitals, setVitals] = useState({
    heartRate: 72,
    spo2: 98,
    temperature: 36.8,
    bloodPressure: { systolic: 120, diastolic: 80 },
  });

  // Simulate real-time data updates using polling pattern (not WebSocket)
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setVitals(prev => ({
        heartRate: prev.heartRate + Math.floor(Math.random() * 5) - 2,
        spo2: Math.min(100, Math.max(95, prev.spo2 + Math.floor(Math.random() * 3) - 1)),
        temperature: +(prev.temperature + (Math.random() * 0.2 - 0.1)).toFixed(1),
        bloodPressure: {
          systolic: prev.bloodPressure.systolic + Math.floor(Math.random() * 3) - 1,
          diastolic: prev.bloodPressure.diastolic + Math.floor(Math.random() * 3) - 1,
        },
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleConnect = () => {
    if (!deviceId.trim()) return;
    
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      onConnect();
    }, 1500);
  };

  const getStatus = (type: string, value: number) => {
    if (type === 'heartRate') {
      if (value < 60 || value > 100) return { label: 'Warning', color: 'alert-warning' };
      return { label: 'Normal', color: 'alert-normal' };
    }
    if (type === 'spo2') {
      if (value < 95) return { label: 'Critical', color: 'alert-critical' };
      return { label: 'Normal', color: 'alert-normal' };
    }
    if (type === 'temperature') {
      if (value > 37.5) return { label: 'Warning', color: 'alert-warning' };
      return { label: 'Normal', color: 'alert-normal' };
    }
    return { label: 'Normal', color: 'alert-normal' };
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-calm-fade-in">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-soft-lg card-soft">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-alert-normal/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-alert-normal" />
              </div>
              <div>
                <CardTitle className="text-2xl">Device Health Monitor</CardTitle>
                <CardDescription>Connect and monitor your IoT medical device</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {!isConnected ? (
            <div className="space-y-6">
              <div className="text-center py-8">
                <img 
                  src="/assets/generated/iot-medical-device.dim_400x300.png" 
                  alt="IoT Medical Device"
                  className="w-64 h-48 object-contain mx-auto mb-6 rounded-xl"
                />
                <h3 className="text-xl font-semibold mb-2">Connect Your Device</h3>
                <p className="text-muted-foreground mb-6">
                  Enter your device ID to start real-time health monitoring
                </p>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  placeholder="e.g., MED-2024-001"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  className="text-center text-lg"
                />
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={connecting || !deviceId.trim()}
                className="w-full max-w-md mx-auto block rounded-full hover-lift"
                size="lg"
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect Device'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-alert-normal/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-alert-normal animate-soft-pulse"></div>
                  <span className="font-medium">Device Connected</span>
                </div>
                <Badge variant="outline" className="bg-alert-normal/20 text-alert-normal border-alert-normal/30">
                  Live
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Heart Rate */}
                <Card className="card-soft border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Heart Rate</span>
                      </div>
                      <Badge 
                        variant={getStatus('heartRate', vitals.heartRate).color === 'alert-normal' ? 'outline' : 'destructive'}
                        className={getStatus('heartRate', vitals.heartRate).color === 'alert-warning' ? 'bg-alert-warning text-alert-warning-foreground' : ''}
                      >
                        {getStatus('heartRate', vitals.heartRate).label}
                      </Badge>
                    </div>
                    <div className="text-4xl font-semibold mb-1">{vitals.heartRate}</div>
                    <div className="text-sm text-muted-foreground">bpm</div>
                  </CardContent>
                </Card>

                {/* SpO2 */}
                <Card className="card-soft border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary" />
                        <span className="text-sm font-medium">SpO₂</span>
                      </div>
                      <Badge 
                        variant={getStatus('spo2', vitals.spo2).color === 'alert-normal' ? 'outline' : 'destructive'}
                        className={getStatus('spo2', vitals.spo2).color === 'alert-critical' ? 'bg-alert-critical text-alert-critical-foreground' : ''}
                      >
                        {getStatus('spo2', vitals.spo2).label}
                      </Badge>
                    </div>
                    <div className="text-4xl font-semibold mb-1">{vitals.spo2}</div>
                    <div className="text-sm text-muted-foreground">%</div>
                  </CardContent>
                </Card>

                {/* Temperature */}
                <Card className="card-soft border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <Badge 
                        variant={getStatus('temperature', vitals.temperature).color === 'alert-normal' ? 'outline' : 'destructive'}
                        className={getStatus('temperature', vitals.temperature).color === 'alert-warning' ? 'bg-alert-warning text-alert-warning-foreground' : ''}
                      >
                        {getStatus('temperature', vitals.temperature).label}
                      </Badge>
                    </div>
                    <div className="text-4xl font-semibold mb-1">{vitals.temperature}</div>
                    <div className="text-sm text-muted-foreground">°C</div>
                  </CardContent>
                </Card>

                {/* Blood Pressure */}
                <Card className="card-soft border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-secondary" />
                        <span className="text-sm font-medium">Blood Pressure</span>
                      </div>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="text-4xl font-semibold mb-1">
                      {vitals.bloodPressure.systolic}/{vitals.bloodPressure.diastolic}
                    </div>
                    <div className="text-sm text-muted-foreground">mmHg</div>
                  </CardContent>
                </Card>
              </div>

              <Button variant="outline" onClick={onClose} className="w-full rounded-full hover-lift" size="lg">
                Close Monitor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
