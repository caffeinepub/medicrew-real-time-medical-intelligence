import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Shield, MapPin, Bell, Database, ArrowRight, Sparkles, Brain, Stethoscope } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';
  
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const section4Ref = useRef<HTMLElement>(null);
  const section5Ref = useRef<HTMLElement>(null);
  
  const { hasIntersected: section1Visible } = useIntersectionObserver(section1Ref);
  const { hasIntersected: section2Visible } = useIntersectionObserver(section2Ref);
  const { hasIntersected: section3Visible } = useIntersectionObserver(section3Ref);
  const { hasIntersected: section4Visible } = useIntersectionObserver(section4Ref);
  const { hasIntersected: section5Visible } = useIntersectionObserver(section5Ref);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <main className="flex-1 overflow-x-hidden">
      {/* Hero Section - Full Viewport */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 gradient-calm opacity-50"></div>
        
        {/* Content */}
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-10 animate-calm-fade-up">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold leading-tight tracking-tighter text-foreground">
              MediCrew — Intelligent<br />Healthcare in Real Time
            </h1>
            <p className="text-xl md:text-2xl font-normal text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AI-powered health monitoring and connected medical response.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                className="text-lg px-10 py-7 rounded-full shadow-soft-lg hover-lift"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Connecting...' : 'Get Started as Patient'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-7 rounded-full hover-lift"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                Join as Doctor
                <Stethoscope className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: AI Medical Assistance */}
      <section 
        ref={section1Ref}
        className="min-h-screen flex items-center justify-center py-32 px-4"
      >
        <div className={`container max-w-6xl mx-auto transition-all duration-700 ${
          section1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Brain className="w-4 h-4" />
                AI Intelligence
              </div>
              <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tighter">
                AI Medical Assistance
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get instant health analysis powered by advanced AI. Upload symptoms, receive preliminary diagnoses, and connect with nearby medical professionals in seconds.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg">Instant symptom analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg">First aid recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-lg">Connect with verified doctors</span>
                </li>
              </ul>
            </div>
            <Card className="card-soft hover-lift">
              <CardContent className="p-8">
                <img 
                  src="/assets/generated/medical-dashboard-hero.dim_800x400.png"
                  alt="AI Medical Assistance"
                  className="w-full h-auto rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 2: Real-Time Device Monitoring */}
      <section 
        ref={section2Ref}
        className="min-h-screen flex items-center justify-center py-32 px-4 bg-muted/30"
      >
        <div className={`container max-w-6xl mx-auto transition-all duration-700 ${
          section2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Card className="card-soft hover-lift order-2 md:order-1">
              <CardContent className="p-8">
                <img 
                  src="/assets/generated/iot-medical-device.dim_400x300.png"
                  alt="Device Monitoring"
                  className="w-full h-auto rounded-lg"
                />
              </CardContent>
            </Card>
            <div className="space-y-8 order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                <Activity className="w-4 h-4" />
                Live Monitoring
              </div>
              <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tighter">
                Real-Time Device Monitoring
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Connect your IoT medical devices for continuous health tracking. Monitor vitals, receive alerts, and share data with your healthcare team seamlessly.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-soft p-6 rounded-xl">
                  <Heart className="w-8 h-8 text-primary mb-3" />
                  <div className="text-2xl font-semibold mb-1">Heart Rate</div>
                  <div className="text-sm text-muted-foreground">Continuous tracking</div>
                </div>
                <div className="card-soft p-6 rounded-xl">
                  <Activity className="w-8 h-8 text-secondary mb-3" />
                  <div className="text-2xl font-semibold mb-1">Vitals</div>
                  <div className="text-sm text-muted-foreground">Real-time updates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Doctor Alert System */}
      <section 
        ref={section3Ref}
        className="min-h-screen flex items-center justify-center py-32 px-4"
      >
        <div className={`container max-w-6xl mx-auto transition-all duration-700 ${
          section3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-alert-warning/10 text-alert-warning text-sm font-medium">
                <Bell className="w-4 h-4" />
                Emergency Response
              </div>
              <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tighter">
                Doctor Alert System
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Critical health events trigger instant notifications to your medical team. Doctors receive detailed patient data and can respond immediately to emergencies.
              </p>
              <div className="space-y-4">
                <Card className="card-soft border-l-4 border-l-alert-normal">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-alert-normal"></div>
                      <span className="font-medium">Normal Status</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-soft border-l-4 border-l-alert-warning">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-alert-warning"></div>
                      <span className="font-medium">Warning Alert</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-soft border-l-4 border-l-alert-critical">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-alert-critical"></div>
                      <span className="font-medium">Critical Emergency</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <Card className="card-soft hover-lift">
              <CardContent className="p-8">
                <img 
                  src="/assets/generated/emergency-alert-icon-transparent.dim_64x64.png"
                  alt="Alert System"
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 4: Verified Medical Professionals */}
      <section 
        ref={section4Ref}
        className="min-h-screen flex items-center justify-center py-32 px-4 bg-muted/30"
      >
        <div className={`container max-w-6xl mx-auto transition-all duration-700 ${
          section4Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Stethoscope className="w-4 h-4" />
              Trusted Network
            </div>
            <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tighter">
              Verified Medical Professionals
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Connect with certified doctors and healthcare providers. Every professional on our platform is verified and approved by our medical board.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { specialty: 'Cardiology', icon: Heart },
              { specialty: 'General Practice', icon: Stethoscope },
              { specialty: 'Emergency Medicine', icon: Activity }
            ].map((item, i) => (
              <Card key={i} className="card-soft hover-lift text-center">
                <CardHeader>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{item.specialty}</CardTitle>
                  <CardDescription className="text-base">Verified specialists ready to help</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Privacy & Security */}
      <section 
        ref={section5Ref}
        className="min-h-screen flex items-center justify-center py-32 px-4"
      >
        <div className={`container max-w-6xl mx-auto transition-all duration-700 ${
          section5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-alert-normal/10 text-alert-normal text-sm font-medium">
              <Shield className="w-4 h-4" />
              Secure Platform
            </div>
            <h2 className="text-5xl md:text-6xl font-semibold leading-tight tracking-tighter">
              Privacy & Security
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Your health data is protected with enterprise-grade encryption on the Internet Computer blockchain. HIPAA-compliant and fully secure.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-soft hover-lift">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">End-to-End Encryption</CardTitle>
                <CardDescription className="text-base">
                  All medical data is encrypted and stored securely on the blockchain
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card-soft hover-lift">
              <CardHeader>
                <Database className="w-12 h-12 text-secondary mb-4" />
                <CardTitle className="text-2xl">Decentralized Storage</CardTitle>
                <CardDescription className="text-base">
                  No single point of failure with distributed blockchain architecture
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          {/* Final CTA */}
          <div className="text-center mt-20">
            <Button
              size="lg"
              className="text-lg px-12 py-7 rounded-full shadow-soft-lg hover-lift"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Connecting...' : 'Get Started Today'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
