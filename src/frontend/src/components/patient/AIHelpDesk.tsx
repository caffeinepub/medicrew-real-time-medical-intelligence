import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Upload, MessageCircle, MapPin, AlertCircle } from 'lucide-react';
import { isMockMode } from '../../config/env';

interface AIHelpDeskProps {
  onClose: () => void;
}

export default function AIHelpDesk({ onClose }: AIHelpDeskProps) {
  const [step, setStep] = useState<'upload' | 'symptoms' | 'analysis' | 'doctors'>('upload');
  const [symptoms, setSymptoms] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    if (isMockMode) {
      console.warn('🤖 AI Help Desk running in mock mode - using simulated diagnosis');
    }
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    // Simulate AI analysis with polling pattern (not real-time WebSocket)
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalyzing(false);
    setStep('analysis');
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'alert-critical';
      case 'medium': return 'alert-warning';
      default: return 'alert-normal';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-calm-fade-in">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-soft-lg card-soft">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Health Assistant</CardTitle>
                <CardDescription>Get instant medical guidance and find nearby doctors</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {isMockMode && (
            <div className="bg-alert-warning/10 border border-alert-warning/20 rounded-lg p-4">
              <p className="text-sm text-foreground">
                <strong>Mock Mode:</strong> AI features are using simulated data for development.
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {['upload', 'symptoms', 'analysis', 'doctors'].map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`h-2 rounded-full flex-1 transition-all duration-400 ${
                    ['upload', 'symptoms', 'analysis', 'doctors'].indexOf(step) >= i
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              </div>
            ))}
          </div>

          {step === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Medical Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload X-rays, scans, or photos for AI analysis
                </p>
                <Button variant="outline" className="rounded-full">
                  Choose File
                </Button>
              </div>
              <Button onClick={() => setStep('symptoms')} className="w-full rounded-full hover-lift" size="lg">
                Continue
              </Button>
            </div>
          )}

          {step === 'symptoms' && (
            <div className="space-y-6">
              <div>
                <label className="text-base font-medium mb-3 block">Describe Your Symptoms</label>
                <Textarea
                  placeholder="Please describe what you're experiencing..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('upload')} className="flex-1 rounded-full hover-lift">
                  Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={!symptoms.trim() || analyzing}
                  className="flex-1 rounded-full hover-lift"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'analysis' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl bg-${getUrgencyColor(urgency)}/10 border-2 border-${getUrgencyColor(urgency)}/20`}>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className={`w-6 h-6 text-${getUrgencyColor(urgency)}`} />
                  <div>
                    <h3 className="font-semibold text-lg">AI Analysis Complete</h3>
                    <Badge variant="outline" className={`mt-1 bg-${getUrgencyColor(urgency)}/20 text-${getUrgencyColor(urgency)} border-${getUrgencyColor(urgency)}/30`}>
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)} Urgency
                    </Badge>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">
                  Based on your symptoms, we recommend consulting with a healthcare professional. 
                  Your symptoms may indicate a condition that requires medical attention.
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-6">
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Schedule an appointment with a general practitioner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Monitor your symptoms and note any changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Stay hydrated and get adequate rest</span>
                  </li>
                </ul>
              </div>

              <Button onClick={() => setStep('doctors')} className="w-full rounded-full hover-lift" size="lg">
                Find Nearby Doctors
              </Button>
            </div>
          )}

          {step === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">Nearby Doctors</h3>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="card-soft hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">Dr. Sample Doctor {i}</h4>
                          <p className="text-sm text-muted-foreground">General Medicine</p>
                          <p className="text-xs text-muted-foreground mt-1">{i * 0.5} km away</p>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full">
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button variant="outline" onClick={onClose} className="w-full rounded-full hover-lift">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
