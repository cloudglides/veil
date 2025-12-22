export async function getStatisticalEntropy(): Promise<string> {
  const ua = navigator.userAgent;
  const freq: Record<string, number> = {};
  
  for (const char of ua) {
    freq[char] = (freq[char] || 0) + 1;
  }

  const values = Object.values(freq);
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return `mean:${mean.toFixed(4)}|var:${variance.toFixed(4)}|std:${stdDev.toFixed(4)}`;
}
