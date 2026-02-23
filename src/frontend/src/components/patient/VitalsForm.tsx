import { useState } from 'react';
import { useLogVitals } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';

export default function VitalsForm() {
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenSaturation, setOxygenSaturation] = useState('');
  const logVitals = useLogVitals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await logVitals.mutateAsync({
        bloodPressure,
        heartRate: BigInt(heartRate),
        temperature: parseFloat(temperature),
        oxygenSaturation: BigInt(oxygenSaturation),
      });
      
      toast.success('Vitals logged successfully!');
      
      // Reset form
      setBloodPressure('');
      setHeartRate('');
      setTemperature('');
      setOxygenSaturation('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log vitals');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Log Vital Signs</CardTitle>
            <CardDescription>Record your current health measurements</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bloodPressure">Blood Pressure (e.g., 120/80)</Label>
            <Input
              id="bloodPressure"
              type="text"
              placeholder="120/80"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              placeholder="72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              required
              min="30"
              max="250"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="98.6"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
              min="90"
              max="110"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
            <Input
              id="oxygenSaturation"
              type="number"
              placeholder="98"
              value={oxygenSaturation}
              onChange={(e) => setOxygenSaturation(e.target.value)}
              required
              min="70"
              max="100"
            />
          </div>

          <Button type="submit" className="w-full" disabled={logVitals.isPending}>
            {logVitals.isPending ? 'Logging...' : 'Log Vitals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

