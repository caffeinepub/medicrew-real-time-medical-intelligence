import { useState } from 'react';
import { useGetMedicalFacilities, useAddMedicalFacility } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Building2, Plus, MapPin, Phone } from 'lucide-react';
import type { MedicalFacility } from '../../backend';

export default function FacilityManagement() {
  const { data: facilities, isLoading } = useGetMedicalFacilities();
  const addFacility = useAddMedicalFacility();
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    facilityType: 'Hospital',
    distance: '',
    latitude: '',
    longitude: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const facility: MedicalFacility = {
        id: BigInt(Date.now()),
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        facilityType: formData.facilityType,
        distance: parseFloat(formData.distance),
        coordinates: [parseFloat(formData.latitude), parseFloat(formData.longitude)],
      };

      await addFacility.mutateAsync(facility);
      toast.success('Medical facility added successfully');
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        phone: '',
        facilityType: 'Hospital',
        distance: '',
        latitude: '',
        longitude: '',
      });
      setShowForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add facility');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading facilities...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Medical Facilities</CardTitle>
                <CardDescription>Manage hospitals and clinics in the system</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/30">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Facility Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facilityType">Type</Label>
                  <Select
                    value={formData.facilityType}
                    onValueChange={(value) => setFormData({ ...formData, facilityType: value })}
                  >
                    <SelectTrigger id="facilityType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                      <SelectItem value="Emergency Room">Emergency Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addFacility.isPending}>
                  {addFacility.isPending ? 'Adding...' : 'Add Facility'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {!facilities || facilities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No facilities added yet</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {facilities.map((facility) => (
                <Card key={facility.id.toString()} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {facility.facilityType}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {facility.distance.toFixed(1)} mi
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{facility.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{facility.phone}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2">
                      Coordinates: {facility.coordinates[0].toFixed(4)}, {facility.coordinates[1].toFixed(4)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

