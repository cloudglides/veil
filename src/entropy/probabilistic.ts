export async function getProbabilisticEntropy(): Promise<string> {
  const metrics = [];
  
  const screen_values = [screen.width, screen.height, screen.colorDepth];
  const hw_values = [navigator.hardwareConcurrency || 1, (navigator as any).deviceMemory || 4];
  const all_values = [...screen_values, ...hw_values];

  const mean = all_values.reduce((a, b) => a + b) / all_values.length;
  const sorted = [...all_values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor(sorted.length * 3 / 4)];
  const iqr = q3 - q1;

  metrics.push(`mean:${mean.toFixed(2)}`);
  metrics.push(`median:${median.toFixed(2)}`);
  metrics.push(`iqr:${iqr.toFixed(2)}`);

  return metrics.join("|");
}
