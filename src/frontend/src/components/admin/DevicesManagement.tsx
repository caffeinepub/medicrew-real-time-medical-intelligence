import { useState } from 'react';
import { useGetAllDevices, useToggleDeviceStatus, useUnlinkDevice } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Power, Unlink, Link } from 'lucide-react';
import ReassignDeviceModal from './ReassignDeviceModal';
import { Principal } from '@dfinity/principal';
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

export default function DevicesManagement() {
  const { data: devices, isLoading, dataUpdatedAt, refetch, isFetching } = useGetAllDevices();
  const toggleStatus = useToggleDeviceStatus();
  const unlinkDevice = useUnlinkDevice();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState<string | null>(null);

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Synced ${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `Synced ${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `Synced ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Synced just now';
  };

  const getLastSyncTime = (lastSync: bigint) => {
    const timestamp = Number(lastSync) / 1000000; // Convert from nanoseconds to milliseconds
    return getRelativeTime(timestamp);
  };

  const isDataOutdated = dataUpdatedAt && (Date.now() - dataUpdatedAt) > 600000;

  const filteredDevices = devices?.filter(device => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return device.status === 'active';
    if (statusFilter === 'inactive') return device.status === 'inactive';
    if (statusFilter === 'linked') return device.linkedPatientId !== undefined;
    if (statusFilter === 'unlinked') return device.linkedPatientId === undefined;
    return true;
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

  const activeCount = devices?.filter(d => d.status === 'active').length || 0;
  const inactiveCount = devices?.filter(d => d.status === 'inactive').length || 0;
  const linkedCount = devices?.filter(d => d.linkedPatientId !== undefined).length || 0;

  return (
    <div className="space-y-6 animate-calm-fade-in">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Active Devices</CardDescription>
            <CardTitle className="text-3xl text-alert-normal">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Inactive Devices</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{inactiveCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Linked Devices</CardDescription>
            <CardTitle className="text-3xl text-primary">{linkedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-soft border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Devices Management</CardTitle>
              <CardDescription>Manage IoT health monitoring devices</CardDescription>
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
                <SelectValue placeholder="Filter devices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="linked">Linked</SelectItem>
                <SelectItem value="unlinked">Unlinked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Device ID</TableHead>
                  <TableHead>Linked Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices && filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <TableRow key={device.deviceId} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{device.deviceId}</TableCell>
                      <TableCell>
                        {device.linkedPatientId ? (
                          <span className="text-xs font-mono">
                            {device.linkedPatientId.toText().slice(0, 15)}...
                          </span>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Unlinked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            device.status === 'active'
                              ? 'bg-alert-normal/10 text-alert-normal border-alert-normal'
                              : 'bg-muted text-muted-foreground border-border'
                          }
                        >
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getLastSyncTime(device.lastSync)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus.mutate(device.deviceId)}
                            disabled={toggleStatus.isPending}
                            className="hover-lift"
                          >
                            <Power className="w-4 h-4 mr-1" />
                            {device.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDevice(device.deviceId);
                              setShowReassignModal(true);
                            }}
                            className="hover-lift"
                          >
                            <Link className="w-4 h-4 mr-1" />
                            Reassign
                          </Button>
                          {device.linkedPatientId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmUnlink(device.deviceId)}
                              disabled={unlinkDevice.isPending}
                              className="hover-lift text-destructive hover:text-destructive"
                            >
                              <Unlink className="w-4 h-4 mr-1" />
                              Reset
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No devices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedDevice && (
        <ReassignDeviceModal
          open={showReassignModal}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedDevice(null);
          }}
          deviceId={selectedDevice}
        />
      )}

      <AlertDialog open={!!confirmUnlink} onOpenChange={() => setConfirmUnlink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink this device from its patient? This action will clear the patient link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmUnlink) {
                  unlinkDevice.mutate(confirmUnlink);
                  setConfirmUnlink(null);
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
