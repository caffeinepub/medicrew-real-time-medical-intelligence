import { useState } from 'react';
import { useGetAppointments, useUpdateAppointmentStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Calendar, Edit } from 'lucide-react';
import { AppointmentStatus } from '../../backend';
import OverrideAppointmentModal from './OverrideAppointmentModal';

export default function AppointmentsManagement() {
  const { data: appointments, isLoading, dataUpdatedAt, refetch, isFetching } = useGetAppointments();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<bigint | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

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

  const filteredAppointments = appointments?.filter(apt => {
    if (statusFilter === 'all') return true;
    return apt.status === statusFilter;
  });

  const formatDateTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="shadow-soft">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
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

  const totalCount = appointments?.length || 0;
  const pendingCount = appointments?.filter(a => a.status === AppointmentStatus.pending).length || 0;
  const confirmedCount = appointments?.filter(a => a.status === AppointmentStatus.confirmed).length || 0;
  const cancelledCount = appointments?.filter(a => a.status === AppointmentStatus.cancelled).length || 0;

  return (
    <div className="space-y-6 animate-calm-fade-in">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-3xl text-primary">{totalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Confirmed</CardDescription>
            <CardTitle className="text-3xl text-alert-normal">{confirmedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft border-border">
          <CardHeader className="pb-3">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-3xl text-destructive">{cancelledCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-soft border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Appointments Management</CardTitle>
              <CardDescription>View and manage all appointments</CardDescription>
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments && filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={Number(appointment.id)} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs">
                        {appointment.patient.toText().slice(0, 15)}...
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {appointment.doctor.toText().slice(0, 15)}...
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(appointment.startTime)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            appointment.status === AppointmentStatus.confirmed
                              ? 'bg-alert-normal/10 text-alert-normal border-alert-normal'
                              : appointment.status === AppointmentStatus.cancelled
                              ? 'bg-destructive/10 text-destructive border-destructive'
                              : appointment.status === AppointmentStatus.completed
                              ? 'bg-primary/10 text-primary border-primary'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500'
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(appointment.id);
                            setShowOverrideModal(true);
                          }}
                          className="hover-lift"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Override
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No appointments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedAppointment && (
        <OverrideAppointmentModal
          open={showOverrideModal}
          onClose={() => {
            setShowOverrideModal(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment}
        />
      )}
    </div>
  );
}
