import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAppointmentStatus } from '../../hooks/useQueries';
import { AppointmentStatus } from '../../backend';

interface OverrideAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  appointmentId: bigint;
}

export default function OverrideAppointmentModal({ open, onClose, appointmentId }: OverrideAppointmentModalProps) {
  const updateStatus = useUpdateAppointmentStatus();
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [reason, setReason] = useState<string>('');

  const handleOverride = async () => {
    await updateStatus.mutateAsync({ appointmentId, status: newStatus });
    onClose();
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Override Appointment Status</DialogTitle>
          <DialogDescription>
            Change the status of this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              placeholder="Enter reason for status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleOverride} 
            disabled={updateStatus.isPending}
            className="hover-lift"
          >
            {updateStatus.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
