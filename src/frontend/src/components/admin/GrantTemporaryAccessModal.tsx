import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGrantTemporaryAdmin } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Calendar, Clock } from 'lucide-react';

interface GrantTemporaryAccessModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: Principal;
}

export default function GrantTemporaryAccessModal({ open, onClose, targetUserId }: GrantTemporaryAccessModalProps) {
  const grantTemporaryAdmin = useGrantTemporaryAdmin();
  const [duration, setDuration] = useState<string>('24h');
  const [customDate, setCustomDate] = useState<string>('');

  const handleGrant = async () => {
    let expirationTimestamp: bigint;

    if (duration === 'custom' && customDate) {
      const date = new Date(customDate);
      expirationTimestamp = BigInt(date.getTime() * 1000000); // Convert to nanoseconds
    } else {
      const now = Date.now();
      let milliseconds = 0;

      switch (duration) {
        case '1h':
          milliseconds = 60 * 60 * 1000;
          break;
        case '24h':
          milliseconds = 24 * 60 * 60 * 1000;
          break;
        case '7d':
          milliseconds = 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          milliseconds = 24 * 60 * 60 * 1000;
      }

      expirationTimestamp = BigInt((now + milliseconds) * 1000000); // Convert to nanoseconds
    }

    await grantTemporaryAdmin.mutateAsync({ targetUserId, expirationTimestamp });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Temporary Admin Access</DialogTitle>
          <DialogDescription>
            Set the duration for temporary admin privileges
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={duration === '1h' ? 'default' : 'outline'}
                onClick={() => setDuration('1h')}
                className="hover-lift"
              >
                <Clock className="w-4 h-4 mr-1" />
                1 Hour
              </Button>
              <Button
                variant={duration === '24h' ? 'default' : 'outline'}
                onClick={() => setDuration('24h')}
                className="hover-lift"
              >
                <Clock className="w-4 h-4 mr-1" />
                24 Hours
              </Button>
              <Button
                variant={duration === '7d' ? 'default' : 'outline'}
                onClick={() => setDuration('7d')}
                className="hover-lift"
              >
                <Calendar className="w-4 h-4 mr-1" />
                7 Days
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant={duration === 'custom' ? 'default' : 'outline'}
              onClick={() => setDuration('custom')}
              className="w-full hover-lift"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Custom Date
            </Button>
            
            {duration === 'custom' && (
              <Input
                type="datetime-local"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGrant} 
            disabled={grantTemporaryAdmin.isPending || (duration === 'custom' && !customDate)}
            className="hover-lift"
          >
            {grantTemporaryAdmin.isPending ? 'Granting...' : 'Grant Access'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
