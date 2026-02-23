import { useState } from 'react';
import { useGetAllAdmins, usePromoteToAdmin, useRevokeAdmin } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Search, UserPlus, UserMinus } from 'lucide-react';
import { UserRole } from '../../backend';
import { Principal } from '@dfinity/principal';
import GrantTemporaryAccessModal from './GrantTemporaryAccessModal';
import { useQueryClient } from '@tanstack/react-query';

export default function UsersManagement() {
  const { data: admins, isLoading, dataUpdatedAt, refetch, isFetching } = useGetAllAdmins();
  const promoteToAdmin = usePromoteToAdmin();
  const revokeAdmin = useRevokeAdmin();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<Principal | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);

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

  const isDataOutdated = dataUpdatedAt && (Date.now() - dataUpdatedAt) > 600000; // 10 minutes

  const filteredAdmins = admins?.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         admin.user.toText().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.patient:
        return 'bg-primary/10 text-primary border-primary';
      case UserRole.doctor:
        return 'bg-alert-normal/10 text-alert-normal border-alert-normal';
      case UserRole.admin:
        return 'bg-purple-500/10 text-purple-600 border-purple-500';
      case UserRole.superAdmin:
        return 'bg-amber-500/10 text-amber-600 border-amber-500';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDaysRemaining = (expiresAt?: bigint) => {
    if (!expiresAt) return null;
    const now = Date.now() * 1000000;
    const remaining = Number(expiresAt) - now;
    return Math.ceil(remaining / (24 * 60 * 60 * 1000000000));
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
              {[1, 2, 3, 4, 5].map(i => (
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
              <CardTitle className="text-2xl">Users Management</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
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
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or principal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superAdmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins && filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => {
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
                          <Badge variant="outline" className={getRoleBadgeColor(admin.role)}>
                            {admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-alert-normal/10 text-alert-normal border-alert-normal">
                            Active
                          </Badge>
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
                              Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Permanent</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {admin.role !== UserRole.superAdmin && admin.role !== UserRole.admin && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => promoteToAdmin.mutate(admin.user)}
                                  disabled={promoteToAdmin.isPending}
                                  className="hover-lift"
                                >
                                  <UserPlus className="w-4 h-4 mr-1" />
                                  Promote
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(admin.user);
                                    setShowGrantModal(true);
                                  }}
                                  className="hover-lift"
                                >
                                  Grant Temp Access
                                </Button>
                              </>
                            )}
                            {admin.role === UserRole.admin && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => revokeAdmin.mutate(admin.user)}
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
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <GrantTemporaryAccessModal
          open={showGrantModal}
          onClose={() => {
            setShowGrantModal(false);
            setSelectedUser(null);
          }}
          targetUserId={selectedUser}
        />
      )}
    </div>
  );
}
