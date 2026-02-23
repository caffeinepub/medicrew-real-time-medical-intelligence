import { AuditLog } from '../backend';

export function exportAuditLogsToCSV(logs: AuditLog[]) {
  const headers = ['Timestamp', 'Performed By', 'Action', 'Target User', 'Details'];
  
  const rows = logs.map(log => [
    new Date(Number(log.timestamp) / 1000000).toLocaleString(),
    log.performedBy.toText(),
    log.action,
    log.targetUser ? log.targetUser.toText() : '',
    log.metadata || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
