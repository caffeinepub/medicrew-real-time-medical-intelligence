import { useListApprovals, useSetApproval, useVerifyDoctor } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { ApprovalStatus } from '../../backend';

export default function ApprovalManagement() {
  const { data: approvals, isLoading } = useListApprovals();
  const setApproval = useSetApproval();
  const verifyDoctor = useVerifyDoctor();

  const handleApprove = async (principal: string) => {
    try {
      await setApproval.mutateAsync({
        user: { toText: () => principal } as any,
        status: ApprovalStatus.approved,
      });
      toast.success('User approved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve user');
    }
  };

  const handleReject = async (principal: string) => {
    try {
      await setApproval.mutateAsync({
        user: { toText: () => principal } as any,
        status: ApprovalStatus.rejected,
      });
      toast.success('User rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject user');
    }
  };

  const handleVerifyDoctor = async (principal: string) => {
    try {
      await verifyDoctor.mutateAsync({ toText: () => principal } as any);
      toast.success('Doctor verified successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify doctor');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading approvals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingApprovals = approvals?.filter(a => a.status === ApprovalStatus.pending) || [];
  const approvedUsers = approvals?.filter(a => a.status === ApprovalStatus.approved) || [];
  const rejectedUsers = approvals?.filter(a => a.status === ApprovalStatus.rejected) || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{pendingApprovals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl">{approvedUsers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl">{rejectedUsers.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>User Approvals</CardTitle>
              <CardDescription>Manage user access and doctor verification</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!approvals || approvals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No approval requests yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Principal ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.principal.toText()}>
                    <TableCell className="font-mono text-xs">
                      {approval.principal.toText().slice(0, 20)}...
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          approval.status === ApprovalStatus.approved
                            ? 'bg-success/10 text-success border-success'
                            : approval.status === ApprovalStatus.rejected
                            ? 'bg-destructive/10 text-destructive border-destructive'
                            : 'bg-warning/10 text-warning border-warning'
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
                              onClick={() => handleApprove(approval.principal.toText())}
                              disabled={setApproval.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(approval.principal.toText())}
                              disabled={setApproval.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {approval.status === ApprovalStatus.approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyDoctor(approval.principal.toText())}
                            disabled={verifyDoctor.isPending}
                          >
                            Verify as Doctor
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

