export async function getOSEntropy(): Promise<string> {
  const platform = navigator.platform || "unknown";
  const oscpu = (navigator as any).oscpu || "unknown";
  return `${platform}|${oscpu}`;
}
