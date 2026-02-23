import { useGetPatientRecords } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, FileText, Calendar } from 'lucide-react';

type HealthRecordsProps = {
  type: 'vitals' | 'symptoms';
};

export default function HealthRecords({ type }: HealthRecordsProps) {
  const { data: records, isLoading } = useGetPatientRecords();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getSeverityColor = (severity: bigint) => {
    const sev = Number(severity);
    if (sev <= 2) return 'bg-success/10 text-success border-success';
    if (sev <= 3) return 'bg-warning/10 text-warning border-warning';
    return 'bg-destructive/10 text-destructive border-destructive';
  };

  const getSeverityLabel = (severity: bigint) => {
    const labels = ['', 'Mild', 'Mild-Moderate', 'Moderate', 'Moderate-Severe', 'Severe'];
    return labels[Number(severity)] || 'Unknown';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading records...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!records) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Records Yet</CardTitle>
          <CardDescription>Start logging your {type} to see them here</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (type === 'vitals') {
    const vitals = records.vitals || [];
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Recent Vitals</CardTitle>
              <CardDescription>{vitals.length} records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {vitals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No vitals recorded yet</p>
            ) : (
              <div className="space-y-4">
                {vitals.map((vital, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Vital Signs</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(vital.timestamp)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">BP:</span>
                        <span className="ml-2 font-medium">{vital.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">HR:</span>
                        <span className="ml-2 font-medium">{vital.heartRate.toString()} bpm</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="ml-2 font-medium">{vital.temperature.toFixed(1)}°F</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">O2:</span>
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
    );
  }

  const symptoms = records.symptoms || [];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <CardTitle>Recent Symptoms</CardTitle>
            <CardDescription>{symptoms.length} records</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {symptoms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No symptoms recorded yet</p>
          ) : (
            <div className="space-y-4">
              {symptoms.map((symptom, index) => (
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
  );
}

