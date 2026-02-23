import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Navigation, Search } from 'lucide-react';
import { useGetMedicalFacilities } from '../hooks/useQueries';
import { isMockMode } from '../config/env';

export default function HospitalLocator() {
  const { data: facilities, isLoading } = useGetMedicalFacilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);

  const filteredFacilities = facilities?.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.facilityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isMockMode) {
      console.warn('🗺️ Hospital Locator running in mock mode - using simulated facility data');
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isMockMode && (
        <div className="bg-alert-warning/10 border border-alert-warning/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Mock Mode:</strong> Hospital locator is using simulated data for development.
          </p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search hospitals by name or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Map Display */}
      <div className="relative rounded-xl overflow-hidden border-2 border-border">
        <img
          src="/assets/generated/map-mockup.dim_1200x800.png"
          alt="Hospital Map"
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
      </div>

      {/* Facility List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredFacilities && filteredFacilities.length > 0 ? (
          filteredFacilities.map((facility, index) => (
            <Card
              key={Number(facility.id)}
              className={`card-soft hover-lift cursor-pointer transition-all duration-400 ${
                selectedFacility === Number(facility.id) ? 'border-primary border-2 bg-primary/5' : ''
              }`}
              onClick={() => setSelectedFacility(Number(facility.id))}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{facility.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {facility.facilityType}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{facility.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{facility.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        <span>{facility.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full hover-lift">
                    Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No medical facilities found</p>
          </div>
        )}
      </div>
    </div>
  );
}
