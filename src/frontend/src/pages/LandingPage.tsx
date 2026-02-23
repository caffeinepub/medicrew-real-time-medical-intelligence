import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Heart, Shield, MapPin, Bell, Database, ArrowRight, Sparkles, Brain, Zap } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useParallax } from '../hooks/useParallax';
import { useMagneticHover } from '../hooks/useMagneticHover';

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
  
  const parallaxOffset = useParallax(0.3);
  const { elementRef: ctaRef, position: ctaPosition } = useMagneticHover(0.2);

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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-snap-section">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-mesh opacity-60"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/assets/generated/hero-particles.dim_1920x1080.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateY(${parallaxOffset}px)`
          }}
        ></div>
        
        {/* Content */}
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center space-y-8 animate-fade-in-up">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tight">
              MediCrew
            </h1>
            <p className="text-3xl md:text-4xl font-light text-foreground/80 max-w-4xl mx-auto leading-relaxed">
              Intelligent Healthcare in Motion
            </p>
            <p className="text-xl md:text-2xl font-extralight text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience the future of healthcare with AI-powered diagnostics, real-time device monitoring, and instant emergency response
            </p>
            
            <div className="pt-8">
              <Button
                ref={ctaRef as any}
                size="lg"
                className="text-xl px-12 py-8 rounded-full shadow-glow-lg hover:shadow-glow transition-all duration-300 magnetic-hover"
                onClick={handleLogin}
                disabled={isLoggingIn}
                style={{
                  transform: `translate(${ctaPosition.x}px, ${ctaPosition.y}px)`
                }}
              >
                {isLoggingIn ? 'Connecting...' : 'Enter MediCrew'}
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-foreground/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-foreground/30 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Section 1: AI Medical Intelligence */}
      <section 
        ref={section1Ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 scroll-snap-section"
      >
        <div className={`container max-w-7xl mx-auto transition-all duration-1000 ${section1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-panel">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">AI Medical Intelligence</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold leading-tight">
                Instant Health Analysis
              </h2>
              <p className="text-2xl font-light text-muted-foreground leading-relaxed">
                Upload symptoms and images for immediate AI-powered diagnosis with personalized first aid recommendations
              </p>
              <div className="flex gap-4 pt-4">
                <div className="glass-card rounded-2xl p-6 flex-1">
                  <div className="text-4xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="glass-card rounded-2xl p-6 flex-1">
                  <div className="text-4xl font-bold text-primary mb-2">&lt;2s</div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl"></div>
              <div className="relative glass-panel rounded-3xl p-8 glow-primary">
                <img 
                  src="/assets/generated/health-status-icon.dim_256x256.png"
                  alt="AI Analysis"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Real-Time Device Monitoring */}
      <section 
        ref={section2Ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 scroll-snap-section"
      >
        <div className={`container max-w-7xl mx-auto transition-all duration-1000 ${section2Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-success/20 rounded-3xl blur-3xl"></div>
              <div className="relative glass-panel rounded-3xl p-8 glow-success">
                <img 
                  src="/assets/generated/iot-medical-device.dim_400x300.png"
                  alt="Device Monitoring"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-panel">
                <Activity className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">Real-Time Monitoring</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold leading-tight">
                Live Device Tracking
              </h2>
              <p className="text-2xl font-light text-muted-foreground leading-relaxed">
                Connect IoT medical devices for continuous monitoring of heart rate, SpO₂, temperature, and blood pressure
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Heart Rate', icon: Heart, color: 'text-chart-1' },
                  { label: 'Blood Oxygen', icon: Activity, color: 'text-chart-3' },
                  { label: 'Temperature', icon: Zap, color: 'text-chart-4' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 glass-card rounded-xl p-4">
                    <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${item.color}`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Doctor Alert System */}
      <section 
        ref={section3Ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 scroll-snap-section"
      >
        <div className={`container max-w-7xl mx-auto transition-all duration-1000 ${section3Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-panel">
                <Bell className="w-5 h-5 text-warning" />
                <span className="text-sm font-medium">Doctor Alerts</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold leading-tight">
                Instant Emergency Response
              </h2>
              <p className="text-2xl font-light text-muted-foreground leading-relaxed">
                Automatic notifications to verified doctors when critical readings are detected, ensuring immediate medical attention
              </p>
              <div className="glass-card rounded-2xl p-8 border-2 border-warning/30 glow-warning">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center animate-pulse-glow">
                    <Bell className="w-8 h-8 text-warning" />
                  </div>
                  <div>
                    <div className="text-xl font-bold">Critical Alert</div>
                    <div className="text-sm text-muted-foreground">Sent to 3 nearby doctors</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Average response time: &lt;5 minutes
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-warning/20 rounded-3xl blur-3xl"></div>
              <div className="relative glass-panel rounded-3xl p-8">
                <img 
                  src="/assets/generated/emergency-alert-icon-transparent.dim_64x64.png"
                  alt="Emergency Alert"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Secure & Verified Professionals */}
      <section 
        ref={section4Ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 scroll-snap-section"
      >
        <div className={`container max-w-7xl mx-auto transition-all duration-1000 ${section4Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="text-center space-y-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-panel mx-auto">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Secure & Verified</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold leading-tight max-w-4xl mx-auto">
              Trusted Medical Professionals
            </h2>
            <p className="text-2xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              All doctors are verified before accessing patient data. Your health information is secured on the blockchain
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 pt-8">
              {[
                { icon: Shield, title: 'Verified Doctors', desc: 'All medical professionals undergo strict verification' },
                { icon: Database, title: 'Blockchain Security', desc: 'Your data is encrypted and stored on-chain' },
                { icon: MapPin, title: 'Location Privacy', desc: 'Control who sees your location and when' }
              ].map((item, i) => (
                <Card key={i} className="glass-card border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-primary">
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {item.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Call to Action */}
      <section 
        ref={section5Ref}
        className="min-h-screen flex items-center justify-center py-20 px-4 scroll-snap-section"
      >
        <div className={`container max-w-5xl mx-auto text-center transition-all duration-1000 ${section5Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="glass-panel rounded-3xl p-16 space-y-12 glow-primary">
            <div className="space-y-6">
              <h2 className="text-6xl md:text-7xl font-bold leading-tight">
                Ready to Transform Your Healthcare?
              </h2>
              <p className="text-2xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Join thousands of patients and doctors using MediCrew for intelligent, real-time healthcare
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <Button
                size="lg"
                className="text-xl px-12 py-8 rounded-full shadow-glow-lg hover:shadow-glow transition-all duration-300 hover:scale-105"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Connecting...' : 'Get Started Now'}
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/30">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Verified Doctors</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
