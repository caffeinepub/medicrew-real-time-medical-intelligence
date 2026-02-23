import { useState } from 'react';
import { useGetAllAdmins, useRevokeAdmin, usePromoteToAdmin, useExtendAdminExpiry } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, UserMinus, UserPlus, Clock } from 'lucide-react';
import { UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';
import GrantTemporaryAccessModal from './GrantTemporaryAccessModal';
import ExtendExpiryModal from './ExtendExpiryModal';
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

export default function AdminManagement() {
  const { data: admins, isLoading, dataUpdatedAt, refetch, isFetching } = useGetAllAdmins();
  const revokeAdmin = useRevokeAdmin();
  const promoteToAdmin = usePromoteToAdmin();
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<Principal | null>(null);

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

  const getDaysRemaining = (expiresAt?: bigint) => {
    if (!expiresAt) return null;
    const now = Date.now() * 1000000;
    const remaining = Number(expiresAt) - now;
    return Math.ceil(remaining / (24 * 60 * 60 * 1000000000));
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString();
  };

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
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-calm-fade-in">
      <Card className="shadow-soft border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Admin Management</CardTitle>
              <CardDescription>Manage admin users and temporary access</CardDescription>
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
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins && admins.length > 0 ? (
                  admins.map((admin) => {
                    const daysRemaining = getDaysRemaining(admin.expiresAt);
                    
                    return (
                      <TableRow key={admin.user.toText()} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <div className="font-medium">{admin.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {admin.user.toText().slice(0, 20)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              admin.role === UserRole.superAdmin
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500'
                                : 'bg-purple-500/10 text-purple-600 border-purple-500'
                            }
                          >
                            {admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin.expiresAt ? (
                            <span className="text-sm">{formatDate(admin.expiresAt)}</span>
                          ) : (
                            <Badge variant="outline" className="bg-alert-normal/10 text-alert-normal border-alert-normal">
                              Permanent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {daysRemaining !== null ? (
                            <Badge
                              variant="outline"
                              className={
                                daysRemaining < 3
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500'
                                  : 'bg-muted text-muted-foreground border-border'
                              }
                            >
                              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {admin.role === UserRole.admin && admin.expiresAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(admin.user);
                                  setShowExtendModal(true);
                                }}
                                className="hover-lift"
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Extend
                              </Button>
                            )}
                            {admin.role === UserRole.admin && admin.expiresAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => promoteToAdmin.mutate(admin.user)}
                                disabled={promoteToAdmin.isPending}
                                className="hover-lift"
                              >
                                <UserPlus className="w-4 h-4 mr-1" />
                                Make Permanent
                              </Button>
                            )}
                            {admin.role === UserRole.admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmRevoke(admin.user)}
                                disabled={revokeAdmin.isPending}
                                className="hover-lift text-destructive hover:text-destructive"
                              >
                                <UserMinus className="w-4 h-4 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No admin users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <GrantTemporaryAccessModal
            open={showGrantModal}
            onClose={() => {
              setShowGrantModal(false);
              setSelectedUser(null);
            }}
            targetUserId={selectedUser}
          />
          <ExtendExpiryModal
            open={showExtendModal}
            onClose={() => {
              setShowExtendModal(false);
              setSelectedUser(null);
            }}
            targetUserId={selectedUser}
          />
        </>
      )}

      <AlertDialog open={!!confirmRevoke} onOpenChange={() => setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Admin Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke admin access for this user? They will be reverted to their previous role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRevoke) {
                  revokeAdmin.mutate(confirmRevoke);
                  setConfirmRevoke(null);
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
