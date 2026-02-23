import { useGetPatientRecords } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

type AlertType = 'danger' | 'warning' | 'success' | 'info';

interface HealthAlert {
  type: AlertType;
  message: string;
  detail: string;
}

export default function HealthInsights() {
  const { data: records, isLoading } = useGetPatientRecords();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analyzing your health data...</p>
        </div>
      </div>
    );
  }

  if (!records || (records.vitals.length === 0 && records.symptoms.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data Available</CardTitle>
          <CardDescription>Start logging your vitals and symptoms to get AI-powered health insights</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = records.vitals.slice(-10).map((vital, index) => ({
    name: `Reading ${index + 1}`,
    heartRate: Number(vital.heartRate),
    temperature: vital.temperature,
    oxygen: Number(vital.oxygenSaturation),
  }));

  // AI Health Analysis (simulated)
  const analyzeHealth = (): { alerts: HealthAlert[]; recommendations: string[] } => {
    const latestVitals = records.vitals[records.vitals.length - 1];
    const alerts: HealthAlert[] = [];
    const recommendations: string[] = [];

    if (latestVitals) {
      const hr = Number(latestVitals.heartRate);
      const temp = latestVitals.temperature;
      const o2 = Number(latestVitals.oxygenSaturation);

      // Heart rate analysis
      if (hr > 100) {
        alerts.push({ type: 'warning', message: 'Elevated heart rate detected', detail: `${hr} bpm is above normal resting range` });
        recommendations.push('Consider relaxation techniques and monitor for persistent elevation');
      } else if (hr < 60) {
        alerts.push({ type: 'info', message: 'Low heart rate detected', detail: `${hr} bpm may indicate good cardiovascular fitness or bradycardia` });
      }

      // Temperature analysis
      if (temp > 99.5) {
        alerts.push({ type: 'warning', message: 'Elevated temperature', detail: `${temp.toFixed(1)}°F suggests possible fever` });
        recommendations.push('Stay hydrated, rest, and monitor temperature. Consult a doctor if it persists');
      } else if (temp < 97.0) {
        alerts.push({ type: 'info', message: 'Low body temperature', detail: `${temp.toFixed(1)}°F is below normal range` });
      }

      // Oxygen saturation analysis
      if (o2 < 95) {
        alerts.push({ type: 'danger', message: 'Low oxygen saturation', detail: `${o2}% is below normal range` });
        recommendations.push('Seek immediate medical attention if experiencing shortness of breath');
      }

      // Symptom analysis
      const recentSymptoms = records.symptoms.slice(-3);
      const severeSymptomsCount = recentSymptoms.filter(s => Number(s.severity) >= 4).length;
      
      if (severeSymptomsCount > 0) {
        alerts.push({ type: 'danger', message: 'Severe symptoms reported', detail: `${severeSymptomsCount} severe symptom(s) in recent logs` });
        recommendations.push('Consider scheduling a consultation with your healthcare provider');
      }
    }

    if (alerts.length === 0) {
      alerts.push({ type: 'success', message: 'All vitals within normal range', detail: 'Your recent health metrics look good' });
      recommendations.push('Continue maintaining a healthy lifestyle and regular monitoring');
    }

    return { alerts, recommendations };
  };

  const { alerts, recommendations } = analyzeHealth();

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Health Insights</CardTitle>
              <CardDescription>Personalized analysis based on your health data</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts */}
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <Alert 
            key={index} 
            className={
              alert.type === 'danger' ? 'border-destructive bg-destructive/10' :
              alert.type === 'warning' ? 'border-warning bg-warning/10' :
              alert.type === 'success' ? 'border-success bg-success/10' :
              'border-primary bg-primary/10'
            }
          >
            {alert.type === 'danger' && <AlertTriangle className="h-5 w-5 text-destructive" />}
            {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-warning" />}
            {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-success" />}
            {alert.type === 'info' && <Activity className="h-5 w-5 text-primary" />}
            <AlertTitle className={
              alert.type === 'danger' ? 'text-destructive' :
              alert.type === 'warning' ? 'text-warning' :
              alert.type === 'success' ? 'text-success' :
              'text-primary'
            }>
              {alert.message}
            </AlertTitle>
            <AlertDescription>{alert.detail}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Vitals Trends Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Vitals Trends</CardTitle>
            </div>
            <CardDescription>Your health metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="heartRate" stroke="oklch(var(--chart-1))" name="Heart Rate (bpm)" strokeWidth={2} />
                <Line type="monotone" dataKey="oxygen" stroke="oklch(var(--chart-3))" name="Oxygen (%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Health Recommendations</CardTitle>
          <CardDescription>AI-generated advice based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm">{rec}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* First Aid Tips */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>First Aid Tips</CardTitle>
          <CardDescription>Quick reference for common situations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-semibold text-sm">High Fever (&gt;103°F)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Take fever-reducing medication</li>
                <li>Stay hydrated with water</li>
                <li>Use cool compresses</li>
                <li>Seek medical help if persistent</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-semibold text-sm">Low Oxygen (&lt;90%)</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Sit upright</li>
                <li>Practice deep breathing</li>
                <li>Seek immediate medical attention</li>
                <li>Call emergency services if severe</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-semibold text-sm">Chest Pain</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Stop all activity and rest</li>
                <li>Call emergency services immediately</li>
                <li>Chew aspirin if not allergic</li>
                <li>Stay calm and breathe slowly</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-semibold text-sm">Severe Headache</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Rest in a dark, quiet room</li>
                <li>Apply cold compress to forehead</li>
                <li>Stay hydrated</li>
                <li>Seek medical help if sudden/severe</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

