export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `Updated ${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `Updated ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (seconds > 0) {
    return `Updated ${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
  return 'Updated just now';
}
