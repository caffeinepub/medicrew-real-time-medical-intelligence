import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface AddPatientProps {
  onBack: () => void;
}

export default function AddPatient({ onBack }: AddPatientProps) {
  const [patientId, setPatientId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [adding, setAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId.trim() || !deviceId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      toast.success('Patient added successfully!');
      setPatientId('');
      setDeviceId('');
    }, 1500);
  };

  return (
    <main className="flex-1 py-8">
      <div className="container max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Add Patient</h1>
          <p className="text-muted-foreground text-lg">Start monitoring a new patient's health data</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Patient Information</CardTitle>
            <CardDescription>Enter the patient's ID and their device ID to begin monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID (Principal)</Label>
                <Input
                  id="patientId"
                  placeholder="e.g., 2vxsx-fae..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The patient's Internet Identity principal ID
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceId">Device ID</Label>
                <Input
                  id="deviceId"
                  placeholder="e.g., MED-2024-001"
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The patient's connected IoT medical device ID
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-full"
                size="lg"
                disabled={adding || !patientId.trim() || !deviceId.trim()}
              >
                {adding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Adding Patient...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add & Monitor Patient
                  </>
                )}
              </Button>

              <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
                <p className="font-medium mb-1">ℹ️ Patient Consent Required</p>
                <p>Ensure you have the patient's consent before adding them to your monitoring list. All data access is logged for security.</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
