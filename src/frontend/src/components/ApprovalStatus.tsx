import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useIsCallerApproved, useRequestApproval } from '../hooks/useQueries';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function ApprovalStatus() {
  const { data: isApproved, isLoading } = useIsCallerApproved();
  const requestApproval = useRequestApproval();

  if (isLoading) return null;

  if (isApproved) {
    return (
      <Alert className="mb-6 border-success/50 bg-success/10">
        <CheckCircle className="h-5 w-5 text-success" />
        <AlertTitle className="text-success">Account Approved</AlertTitle>
        <AlertDescription>
          Your account has been verified. You have full access to all features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-6 border-warning/50 bg-warning/10">
      <Clock className="h-5 w-5 text-warning" />
      <AlertTitle className="text-warning">Approval Pending</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Your account is awaiting admin approval. Some features may be limited.</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => requestApproval.mutate()}
          disabled={requestApproval.isPending}
          className="ml-4"
        >
          {requestApproval.isPending ? 'Requesting...' : 'Request Approval'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
