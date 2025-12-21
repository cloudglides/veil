export async function getHardwareEntropy(): Promise<string> {
  const cores = navigator.hardwareConcurrency || 1;
  const memory = (navigator as any).deviceMemory || 4;
  
  const computePower = Math.log2(cores) * Math.log2(memory);
  const memoryBits = Math.ceil(Math.log2(memory * 1024));
  const coreEntropy = cores > 0 ? Math.log2(cores) : 0;
  
  return `cores:${cores}|mem:${memory}GB|P(compute)=${computePower.toFixed(3)}|H(cores)=${coreEntropy.toFixed(3)}`;
}
