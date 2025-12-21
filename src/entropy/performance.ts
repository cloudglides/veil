export async function getPerformanceEntropy(): Promise<string> {
  if (!performance.memory) return "perf:unavailable";
  const mem = (performance as any).memory;
  
  const used = mem.usedJSHeapSize;
  const total = mem.totalJSHeapSize;
  const limit = mem.jsHeapSizeLimit;
  
  const utilizationRatio = used / limit;
  const fragmentation = (total - used) / total;
  const headroomBits = Math.log2(limit - used + 1);
  
  return `used:${used}|limit:${limit}|ρ=${utilizationRatio.toFixed(4)}|frag=${fragmentation.toFixed(4)}|H(mem)=${headroomBits.toFixed(2)}`;
}
