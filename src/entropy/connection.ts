export async function getConnectionEntropy(): Promise<string> {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return "connection:unknown";
  
  const rtt = conn.rtt || 0;
  const downlink = conn.downlink || 0;
  
  const bandwidth = Math.log2(downlink * 1000 + 1);
  const latencyEntropy = Math.log2(rtt + 2);
  const connectionScore = (downlink / rtt) * 1000;
  
  return `type:${conn.effectiveType}|bw:${bandwidth.toFixed(3)}|H(RTT)=${latencyEntropy.toFixed(3)}|Q=${connectionScore.toFixed(2)}`;
}
