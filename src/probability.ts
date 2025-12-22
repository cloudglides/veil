export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function hellingerDistance(p: number[], q: number[]): number {
  if (p.length !== q.length) return 0;
  
  const sum = p.reduce((s, pi, i) => s + Math.pow(Math.sqrt(pi) - Math.sqrt(q[i]), 2), 0);
  return Math.sqrt(sum / 2);
}
