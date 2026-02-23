import { useState } from 'react';
import { useGetAuditLogs } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Download, Search } from 'lucide-react';
import { exportAuditLogsToCSV } from '../../utils/csvExport';

export default function AuditLogsManagement() {
  const { data: logs, isLoading, refetch, isFetching } = useGetAuditLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.performedBy.toText().toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetUser && log.targetUser.toText().toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    
    return matchesSearch && matchesAction;
  });

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('Grant') || action.includes('Promote')) {
      return 'bg-alert-normal/10 text-alert-normal border-alert-normal';
    }
    if (action.includes('Revoke') || action.includes('Reject')) {
      return 'bg-destructive/10 text-destructive border-destructive';
    }
    if (action.includes('Extend') || action.includes('Approve')) {
      return 'bg-primary/10 text-primary border-primary';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  const handleExport = () => {
    if (filteredLogs) {
      exportAuditLogsToCSV(filteredLogs);
    }
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
              <CardTitle className="text-2xl">Audit Logs</CardTitle>
              <CardDescription>View all admin actions and system events</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!filteredLogs || filteredLogs.length === 0}
                className="hover-lift"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
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
                placeholder="Search by user or action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Grant Admin">Grant Admin</SelectItem>
                <SelectItem value="Revoke Admin">Revoke Admin</SelectItem>
                <SelectItem value="Extend Admin">Extend Admin</SelectItem>
                <SelectItem value="Approve Doctor">Approve Doctor</SelectItem>
                <SelectItem value="Suspend User">Suspend User</SelectItem>
                <SelectItem value="Reassign Device">Reassign Device</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-sm">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.performedBy.toText().slice(0, 15)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.targetUser ? `${log.targetUser.toText().slice(0, 15)}...` : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.metadata || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
