import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Shield, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Heart className="w-4 h-4" />
                <span>Advanced Medical Data Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Health,
                <br />
                <span className="text-primary">Digitally Managed</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                MediCrew 2.0 connects patients and doctors through secure, blockchain-powered health data management. Track vitals, log symptoms, and get AI-powered health insights.
              </p>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Click the Login button in the header to get started with Internet Identity
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/assets/generated/medical-dashboard-hero.dim_800x400.png" 
                alt="Medical Dashboard"
                className="rounded-2xl shadow-2xl border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Health Management</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to monitor, track, and manage your health data in one secure platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Vitals Tracking</CardTitle>
                <CardDescription>
                  Monitor blood pressure, heart rate, temperature, and oxygen saturation in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Data Visualization</CardTitle>
                <CardDescription>
                  Beautiful charts and graphs to visualize your health trends over time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Doctor Verification</CardTitle>
                <CardDescription>
                  All doctors are verified by admins before they can access patient data
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI Health Insights</CardTitle>
                <CardDescription>
                  Get intelligent health predictions and first aid advice based on your data
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join MediCrew 2.0 today and experience the future of medical data management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-5 h-5 text-primary" />
              <span>Easy to Use</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-5 h-5 text-primary" />
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

