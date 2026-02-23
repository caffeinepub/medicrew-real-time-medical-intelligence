import { useState } from 'react';
import { useRegisterDoctor, useRequestApproval } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Stethoscope, User } from 'lucide-react';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const registerDoctor = useRegisterDoctor();
  const requestApproval = useRequestApproval();

  const handlePatientSelection = async () => {
    try {
      await requestApproval.mutateAsync();
      toast.success('Welcome! Your patient account is being set up.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register as patient');
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorName.trim() || !specialty) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await registerDoctor.mutateAsync({ name: doctorName.trim(), specialty });
      toast.success('Doctor registration submitted! Awaiting verification.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register as doctor');
    }
  };

  if (selectedRole === 'doctor') {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Join as Doctor</CardTitle>
            <CardDescription className="text-base">Provide your information to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDoctorSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Dr. John Smith"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Medical Specialization</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Practice</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="psychiatry">Psychiatry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 rounded-full" size="lg" disabled={registerDoctor.isPending}>
                  {registerDoctor.isPending ? 'Submitting...' : 'Continue'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSelectedRole(null)} className="rounded-full">
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to MediCrew</h1>
          <p className="text-muted-foreground text-lg">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="glass-card border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={handlePatientSelection}>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <User className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl mb-3">I'm a Patient</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Monitor your health with IoT devices, get AI-powered insights, and connect with verified doctors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Real-time health monitoring
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  AI symptom analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Book appointments
                </li>
              </ul>
              <Button 
                className="w-full rounded-full mt-6" 
                size="lg"
                disabled={requestApproval.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePatientSelection();
                }}
              >
                {requestApproval.isPending ? 'Setting up...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedRole('doctor')}>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl mb-3">I'm a Doctor</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Monitor patients in real-time, receive critical alerts, and provide expert care remotely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Monitor multiple patients
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Instant critical alerts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Verified credentials
                </li>
              </ul>
              <Button 
                className="w-full rounded-full mt-6" 
                size="lg"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRole('doctor');
                }}
              >
                Join as Doctor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
