import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function DoctorVerification() {
  const [certificate, setCertificate] = useState<File | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificate(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificate || !specialty) {
      toast.error('Please complete all fields');
      return;
    }

    setSubmitted(true);
    toast.success('Verification request submitted!');
  };

  if (submitted) {
    return (
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl glass-card">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-warning" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Verification Pending</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Your credentials are being reviewed by our admin team. You'll receive access once verified.
            </p>
            <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-sm text-muted-foreground">
                <strong>What happens next?</strong><br />
                Our team will verify your medical degree and credentials. This typically takes 24-48 hours. You'll be notified once approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Doctor Verification</CardTitle>
          <CardDescription className="text-base">
            Upload your credentials to get verified and start monitoring patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="certificate">Medical Degree Certificate</Label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  id="certificate"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCertificateUpload}
                  className="hidden"
                />
                <label htmlFor="certificate" className="cursor-pointer">
                  {certificate ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-12 h-12 text-success mx-auto" />
                      <p className="text-sm font-medium">{certificate.name}</p>
                      <p className="text-xs text-muted-foreground">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm font-medium">Click to upload certificate</p>
                      <p className="text-xs text-muted-foreground">PDF or Image (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>
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

            <Button 
              type="submit" 
              className="w-full rounded-full"
              size="lg"
              disabled={!certificate || !specialty}
            >
              Submit for Verification
            </Button>

            <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-1">🔒 Secure Verification</p>
              <p>Your credentials are encrypted and reviewed by our admin team. We take doctor verification seriously to ensure patient safety.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
