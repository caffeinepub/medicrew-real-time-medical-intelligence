import { useState } from 'react';
import { useLogSymptom } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export default function SymptomsForm() {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('3');
  const logSymptom = useLogSymptom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please describe your symptoms');
      return;
    }

    try {
      await logSymptom.mutateAsync({
        description: description.trim(),
        severity: BigInt(severity),
      });
      
      toast.success('Symptom logged successfully!');
      
      // Reset form
      setDescription('');
      setSeverity('3');
    } catch (error: any) {
      toast.error(error.message || 'Failed to log symptom');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Log Symptoms</CardTitle>
            <CardDescription>Record any symptoms you're experiencing</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Symptom Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your symptoms in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Mild</SelectItem>
                <SelectItem value="2">2 - Mild to Moderate</SelectItem>
                <SelectItem value="3">3 - Moderate</SelectItem>
                <SelectItem value="4">4 - Moderate to Severe</SelectItem>
                <SelectItem value="5">5 - Severe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={logSymptom.isPending}>
            {logSymptom.isPending ? 'Logging...' : 'Log Symptom'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

