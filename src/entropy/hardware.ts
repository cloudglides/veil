export async function getHardwareEntropy(): Promise<string> {
  const cores = navigator.hardwareConcurrency || "unknown";
  const memory = (navigator as any).deviceMemory || "unknown";
  return `cores:${cores}|memory:${memory}`;
}
