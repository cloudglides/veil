export async function getOSVersionEntropy(): Promise<string> {
  const ua = navigator.userAgent;
  const match = ua.match(/Windows NT|Mac OS|Linux|Android|iOS/i);
  const os = match ? match[0] : "unknown";
  return os;
}
