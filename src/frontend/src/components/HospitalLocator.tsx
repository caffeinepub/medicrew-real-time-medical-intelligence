import { useState } from 'react';
import { useGetMedicalFacilities } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Navigation, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HospitalLocator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [mapZoom, setMapZoom] = useState(1);
  const { data: facilities = [], isLoading } = useGetMedicalFacilities();

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.facilityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-card rounded-full"
          />
        </div>
      </div>

      {/* Dark Mode Map Mockup */}
      <Card className="glass-panel border-2 border-primary/20 overflow-hidden">
        <div className="relative">
          <img 
            src="/assets/generated/map-mockup.dim_1200x800.png"
            alt="Medical Facilities Map"
            className="w-full h-96 object-cover"
            style={{ transform: `scale(${mapZoom})`, transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
          
          {/* Glowing Markers */}
          <div className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-primary animate-pulse-glow cursor-pointer"></div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-primary animate-pulse-glow cursor-pointer"></div>
          <div className="absolute top-2/3 left-2/3 w-8 h-8 rounded-full bg-primary animate-pulse-glow cursor-pointer"></div>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button 
              size="icon" 
              className="rounded-full glass-panel"
              onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 2))}
            >
              +
            </Button>
            <Button 
              size="icon" 
              className="rounded-full glass-panel"
              onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 1))}
            >
              −
            </Button>
          </div>
        </div>
      </Card>

      {/* Facilities List */}
      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <Card className="glass-card col-span-full">
            <CardContent className="pt-12 pb-12 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No facilities found</p>
            </CardContent>
          </Card>
        ) : (
          filteredFacilities.map((facility, index) => (
            <Card 
              key={facility.id.toString()} 
              className="glass-panel border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:glow-primary animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{facility.name}</CardTitle>
                    <Badge className="mb-2">{facility.facilityType}</Badge>
                    <CardDescription className="text-sm">{facility.address}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{facility.distance.toFixed(1)} km</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{facility.phone}</span>
                </div>
                <Button className="w-full rounded-full" size="sm">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
