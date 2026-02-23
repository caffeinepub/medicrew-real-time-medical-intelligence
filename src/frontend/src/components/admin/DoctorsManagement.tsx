import { useState } from 'react';
import { useListApprovals, useSetApproval, useVerifyDoctor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { ApprovalStatus } from '../../backend';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DoctorsManagement() {
  const { data: approvals, isLoading, dataUpdatedAt, refetch, isFetching } = useListApprovals();
  const setApproval = useSetApproval();
  const verifyDoctor = useVerifyDoctor();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; principal: string } | null>(null);

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Updated just now';
  };

  const isDataOutdated = dataUpdatedAt && (Date.now() - dataUpdatedAt) > 600000;

  const handleApprove = async (principal: string) => {
    try {
      await setApproval.mutateAsync({
        user: { toText: () => principal } as any,
        status: ApprovalStatus.approved,
      });
      await verifyDoctor.mutateAsync({ toText: () => principal } as any);
      toast.success('Doctor approved and verified successfully', { duration: 3000 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve doctor', { duration: 5000 });
    }
  };

  const handleReject = async (principal: string) => {
    try {
      await setApproval.mutateAsync({
        user: { toText: () => principal } as any,
        status: ApprovalStatus.rejected,
      });
      toast.success('Doctor application rejected', { duration: 3000 });
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject doctor', { duration: 5000 });
    }
  };

  const filteredApprovals = approvals?.filter(approval => {
    if (statusFilter === 'all') return true;
    return approval.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = approvals?.filter(a => a.status === ApprovalStatus.pending).length || 0;
  const approvedCount = approvals?.filter(a => a.status === ApprovalStatus.approved).length || 0;
  const rejectedCount = approvals?.filter(a => a.status === ApprovalStatus.rejected).length || 0;

  return (
    <div className="space-y-6 animate-calm-fade-in">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-alert-normal">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-destructive">{rejectedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-soft border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Doctors Management</CardTitle>
              <CardDescription>Review and approve doctor registrations</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {dataUpdatedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {getRelativeTime(dataUpdatedAt)}
                  </span>
                  {isDataOutdated && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500">
                      Data may be outdated
                    </Badge>
                  )}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="hover-lift"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Principal ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals && filteredApprovals.length > 0 ? (
                  filteredApprovals.map((approval) => (
                    <TableRow key={approval.principal.toText()} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs">
                        {approval.principal.toText().slice(0, 30)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            approval.status === ApprovalStatus.approved
                              ? 'bg-alert-normal/10 text-alert-normal border-alert-normal'
                              : approval.status === ApprovalStatus.rejected
                              ? 'bg-destructive/10 text-destructive border-destructive'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500'
                          }
                        >
                          {approval.status === ApprovalStatus.approved && <CheckCircle className="w-3 h-3 mr-1" />}
                          {approval.status === ApprovalStatus.rejected && <XCircle className="w-3 h-3 mr-1" />}
                          {approval.status === ApprovalStatus.pending && <Clock className="w-3 h-3 mr-1" />}
                          {approval.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {approval.status === ApprovalStatus.pending && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmAction({ type: 'approve', principal: approval.principal.toText() })}
                                disabled={setApproval.isPending || verifyDoctor.isPending}
                                className="hover-lift"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmAction({ type: 'reject', principal: approval.principal.toText() })}
                                disabled={setApproval.isPending}
                                className="hover-lift text-destructive hover:text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No doctor applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'approve' ? 'Approve Doctor' : 'Reject Doctor'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'approve'
                ? 'Are you sure you want to approve this doctor? They will be granted access to patient records.'
                : 'Are you sure you want to reject this doctor application?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) {
                  if (confirmAction.type === 'approve') {
                    handleApprove(confirmAction.principal);
                  } else {
                    handleReject(confirmAction.principal);
                  }
                  setConfirmAction(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
