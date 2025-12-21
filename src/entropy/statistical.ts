export async function getStatisticalEntropy(): Promise<string> {
  const samples = [];
  for (let i = 0; i < 100; i++) {
    const now = performance.now();
    samples.push(now % 1);
  }

  const mean = samples.reduce((a, b) => a + b) / samples.length;
  const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  return `mean:${mean.toFixed(4)}|var:${variance.toFixed(4)}|std:${stdDev.toFixed(4)}`;
}
