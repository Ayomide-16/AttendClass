export function formatLoggedAt(logged_at: string | null, raw_time: string | null) {
  if (logged_at) {
    const d = new Date(logged_at);
    return d.toLocaleString('en-NG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  if (raw_time) return raw_time;
  return "Unknown time";
}
