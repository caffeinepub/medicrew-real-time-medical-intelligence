import { useState } from 'react';
import { useRegisterDoctor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Stethoscope, Clock } from 'lucide-react';

export default function DoctorRegistration() {
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const registerDoctor = useRegisterDoctor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !specialty.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await registerDoctor.mutateAsync({ name: name.trim(), specialty: specialty.trim() });
      toast.success('Registration submitted successfully!');
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <Alert className="border-warning bg-warning/10">
          <Clock className="h-5 w-5 text-warning" />
          <AlertTitle className="text-warning">Pending Verification</AlertTitle>
          <AlertDescription className="mt-2">
            Your doctor registration has been submitted and is pending admin approval. You will be notified once your account is verified.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Registration Submitted</CardTitle>
            <CardDescription>
              Thank you for registering as a doctor. An administrator will review your application shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Doctor Registration</CardTitle>
        <CardDescription>Register as a medical professional to access patient records</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Dr. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Medical Specialty</Label>
            <Input
              id="specialty"
              type="text"
              placeholder="e.g., Cardiology, General Practice"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            />
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              Your registration will be reviewed by an administrator before you can access patient records.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={registerDoctor.isPending}>
            {registerDoctor.isPending ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

