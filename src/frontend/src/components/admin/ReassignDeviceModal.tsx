import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useLinkDevice } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';

interface ReassignDeviceModalProps {
  open: boolean;
  onClose: () => void;
  deviceId: string;
}

export default function ReassignDeviceModal({ open, onClose, deviceId }: ReassignDeviceModalProps) {
  const linkDevice = useLinkDevice();
  const [patientId, setPatientId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleReassign = async () => {
    try {
      setError('');
      const principal = Principal.fromText(patientId);
      await linkDevice.mutateAsync({ deviceId, patientId: principal });
      onClose();
      setPatientId('');
    } catch (err: any) {
      setError(err.message || 'Invalid principal ID');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Device</DialogTitle>
          <DialogDescription>
            Link this device to a different patient
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Device ID</Label>
            <Input value={deviceId} disabled className="font-mono text-sm" />
          </div>

          <div className="space-y-2">
            <Label>Patient Principal ID</Label>
            <Input
              placeholder="Enter patient principal ID..."
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                setError('');
              }}
              className="font-mono text-sm"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReassign} 
            disabled={linkDevice.isPending || !patientId}
            className="hover-lift"
          >
            {linkDevice.isPending ? 'Reassigning...' : 'Reassign Device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
