export async function getConnectionEntropy(): Promise<string> {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return "connection:unknown";
  return `type:${conn.effectiveType}|downlink:${conn.downlink}|rtt:${conn.rtt}`;
}
