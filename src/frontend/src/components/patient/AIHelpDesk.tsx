import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Sparkles, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIHelpDeskProps {
  onClose: () => void;
}

export default function AIHelpDesk({ onClose }: AIHelpDeskProps) {
  const [symptoms, setSymptoms] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() && !image) return;

    setAnalyzing(true);
    setAnalysisStep(0);
    
    // Simulate multi-step analysis
    const steps = ['Analyzing symptoms...', 'Processing image...', 'Generating recommendations...'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisStep(i + 1);
    }
    
    setTimeout(() => {
      const urgency = symptoms.toLowerCase().includes('severe') || symptoms.toLowerCase().includes('emergency') ? 'Emergency' : 
                     symptoms.toLowerCase().includes('pain') ? 'Warning' : 'Normal';
      
      setResult({
        condition: 'Common Cold',
        confidence: 85,
        urgency,
        firstAid: [
          'Rest and stay hydrated',
          'Take over-the-counter pain relievers if needed',
          'Monitor temperature regularly',
          'Seek medical attention if symptoms worsen',
        ],
        nearbyDoctors: [
          { name: 'Dr. Sarah Johnson', specialty: 'General Practice', distance: '1.2 km' },
          { name: 'Dr. Michael Chen', specialty: 'Internal Medicine', distance: '2.5 km' },
        ],
      });
      setAnalyzing(false);
      setAnalysisStep(0);
    }, 2400);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'critical';
      case 'Warning': return 'warning';
      default: return 'success';
    }
  };

  const getUrgencyGlow = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'glow-critical';
      case 'Warning': return 'glow-warning';
      default: return 'glow-success';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-end animate-fade-in">
      <Card className="w-full max-w-2xl h-[95vh] flex flex-col shadow-glow-lg glass-panel border-2 border-primary/30 m-4 animate-slide-in-right">
        <CardHeader className="border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl">AI Help Desk</CardTitle>
                <CardDescription className="text-base">Instant health analysis and first aid</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-destructive/20">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-8 space-y-8">
          {!result ? (
            <>
              {analyzing && (
                <div className="glass-card rounded-2xl p-8 space-y-4 animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <div>
                      <div className="text-lg font-medium">Analyzing...</div>
                      <div className="text-sm text-muted-foreground">
                        {analysisStep === 1 && 'Analyzing symptoms...'}
                        {analysisStep === 2 && 'Processing image...'}
                        {analysisStep === 3 && 'Generating recommendations...'}
                      </div>
                    </div>
                  </div>
                  <Progress value={(analysisStep / 3) * 100} className="h-2" />
                </div>
              )}

              {!analyzing && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="image" className="text-base">Upload Image (Optional)</Label>
                    <div className="border-2 border-dashed border-border/50 rounded-2xl p-10 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer glass-card">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="image" className="cursor-pointer">
                        {image ? (
                          <div className="space-y-3 animate-scale-in">
                            <CheckCircle className="w-16 h-16 text-success mx-auto" />
                            <p className="text-base font-medium">{image.name}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                            <p className="text-base text-muted-foreground">Click to upload an image</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="symptoms" className="text-base">Describe Your Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="E.g., I have a headache and fever for 2 days..."
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={8}
                      className="resize-none text-base glass-card"
                    />
                  </div>

                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!symptoms.trim() && !image}
                    className="w-full rounded-full shadow-glow"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Symptoms
                  </Button>

                  <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground border border-warning/30">
                    <p className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Disclaimer
                    </p>
                    <p>This is an AI simulation for demonstration purposes only. Always consult with a qualified healthcare professional for medical advice.</p>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              {/* Result Card with Urgency Glow */}
              <Card className={`glass-panel border-2 ${getUrgencyGlow(result.urgency)} animate-scale-in`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Analysis Result</CardTitle>
                    <Badge 
                      variant={result.urgency === 'Emergency' ? 'destructive' : 'default'}
                      className={`text-base px-4 py-1 ${
                        result.urgency === 'Warning' ? 'bg-warning text-warning-foreground' : 
                        result.urgency === 'Normal' ? 'bg-success text-success-foreground' : ''
                      }`}
                    >
                      {result.urgency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Probable Condition</p>
                    <p className="text-3xl font-bold">{result.condition}</p>
                    <p className="text-base text-muted-foreground mt-2">Confidence: {result.confidence}%</p>
                  </div>
                </CardContent>
              </Card>

              {/* First Aid Steps */}
              <Card className="glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6" />
                    First Aid Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {result.firstAid.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm font-bold text-primary">{i + 1}</span>
                        </div>
                        <span className="text-base">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Nearby Doctors with Map */}
              <Card className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <MapPin className="w-6 h-6" />
                      Nearby Doctors
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                      className="rounded-full"
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showMap && (
                    <div className="relative rounded-2xl overflow-hidden mb-4 animate-scale-in">
                      <img 
                        src="/assets/generated/map-mockup.dim_1200x800.png"
                        alt="Doctors Map"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                    </div>
                  )}
                  
                  {result.nearbyDoctors.map((doctor: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl glass-card hover:border-primary/30 transition-all">
                      <div>
                        <p className="font-medium text-base">{doctor.name}</p>
                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-medium">{doctor.distance}</p>
                        </div>
                        <Button size="sm" className="rounded-full">
                          Notify
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={() => setResult(null)} variant="outline" className="w-full rounded-full" size="lg">
                New Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
