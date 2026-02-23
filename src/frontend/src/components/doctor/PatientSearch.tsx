import { useState } from 'react';
import { useGetPatientRecordsByUser } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { Search, User, Activity, FileText, Calendar } from 'lucide-react';
import type { PatientRecord } from '../../backend';

export default function PatientSearch() {
  const [principalId, setPrincipalId] = useState('');
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const getPatientRecords = useGetPatientRecordsByUser();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!principalId.trim()) {
      toast.error('Please enter a patient principal ID');
      return;
    }

    try {
      const principal = Principal.fromText(principalId.trim());
      const records = await getPatientRecords.mutateAsync(principal);
      
      if (records) {
        setPatientRecord(records);
        toast.success('Patient records loaded');
      } else {
        setPatientRecord(null);
        toast.info('No records found for this patient');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.message || 'Failed to load patient records');
      setPatientRecord(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getSeverityLabel = (severity: bigint) => {
    const labels = ['', 'Mild', 'Mild-Moderate', 'Moderate', 'Moderate-Severe', 'Severe'];
    return labels[Number(severity)] || 'Unknown';
  };

  const getSeverityColor = (severity: bigint) => {
    const sev = Number(severity);
    if (sev <= 2) return 'bg-success/10 text-success border-success';
    if (sev <= 3) return 'bg-warning/10 text-warning border-warning';
    return 'bg-destructive/10 text-destructive border-destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Search Patient Records</CardTitle>
              <CardDescription>Enter a patient's principal ID to view their medical records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter patient principal ID..."
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={getPatientRecords.isPending}>
              {getPatientRecords.isPending ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {patientRecord && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Vitals */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Vital Signs</CardTitle>
                  <CardDescription>{patientRecord.vitals.length} records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {patientRecord.vitals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No vitals recorded</p>
                ) : (
                  <div className="space-y-4">
                    {patientRecord.vitals.map((vital, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Vital Signs</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(vital.timestamp)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Blood Pressure:</span>
                            <span className="ml-2 font-medium">{vital.bloodPressure}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Heart Rate:</span>
                            <span className="ml-2 font-medium">{vital.heartRate.toString()} bpm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Temperature:</span>
                            <span className="ml-2 font-medium">{vital.temperature.toFixed(1)}°F</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Oxygen:</span>
                            <span className="ml-2 font-medium">{vital.oxygenSaturation.toString()}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Symptoms</CardTitle>
                  <CardDescription>{patientRecord.symptoms.length} records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {patientRecord.symptoms.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No symptoms recorded</p>
                ) : (
                  <div className="space-y-4">
                    {patientRecord.symptoms.map((symptom, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className={getSeverityColor(symptom.severity)}>
                            {getSeverityLabel(symptom.severity)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(symptom.timestamp)}
                          </div>
                        </div>
                        <p className="text-sm">{symptom.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

