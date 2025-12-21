export async function getPerformanceEntropy(): Promise<string> {
  if (!performance.memory) return "perf:unavailable";
  const mem = (performance as any).memory;
  return `used:${mem.usedJSHeapSize}|total:${mem.totalJSHeapSize}|limit:${mem.jsHeapSizeLimit}`;
}
