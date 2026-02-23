import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useExtendAdminExpiry } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Calendar } from 'lucide-react';

interface ExtendExpiryModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: Principal;
}

export default function ExtendExpiryModal({ open, onClose, targetUserId }: ExtendExpiryModalProps) {
  const extendExpiry = useExtendAdminExpiry();
  const [newDate, setNewDate] = useState<string>('');

  const handleExtend = async () => {
    if (!newDate) return;
    
    const date = new Date(newDate);
    const expirationTimestamp = BigInt(date.getTime() * 1000000); // Convert to nanoseconds

    await extendExpiry.mutateAsync({ targetUserId, newExpirationTimestamp: expirationTimestamp });
    onClose();
    setNewDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Admin Expiry</DialogTitle>
          <DialogDescription>
            Set a new expiration date for this admin's access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>New Expiration Date</Label>
            <Input
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExtend} 
            disabled={extendExpiry.isPending || !newDate}
            className="hover-lift"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {extendExpiry.isPending ? 'Extending...' : 'Extend Expiry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
