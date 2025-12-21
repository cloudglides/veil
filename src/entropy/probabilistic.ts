export async function getProbabilisticEntropy(): Promise<string> {
  const metrics = [];

  const p1 = Math.random();
  const p2 = Math.random();
  const bayesian = (p1 * 0.7) / (p1 * 0.7 + (1 - p2) * 0.3);
  metrics.push(`bayes:${bayesian.toFixed(4)}`);

  const samples = Array(100).fill(0).map(() => Math.random());
  const sorted = samples.sort((a, b) => a - b);
  const median = (sorted[49] + sorted[50]) / 2;
  metrics.push(`median:${median.toFixed(4)}`);

  const q1 = sorted[25];
  const q3 = sorted[75];
  const iqr = q3 - q1;
  metrics.push(`iqr:${iqr.toFixed(4)}`);

  return metrics.join("|");
}
