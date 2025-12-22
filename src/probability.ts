export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
}

export function calculateStdDev(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}

export function normalPDF(x: number, mean: number, stdDev: number): number {
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
}

export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export function chiSquareGoodnessOfFit(observed: number[], expected: number[]): number {
  if (observed.length !== expected.length) return 0;
  
  return observed.reduce((sum, obs, i) => {
    const exp = expected[i];
    if (exp === 0) return sum;
    return sum + Math.pow(obs - exp, 2) / exp;
  }, 0);
}

export function bernoulliProbability(k: number, n: number, p: number): number {
  const combination = factorial(n) / (factorial(k) * factorial(n - k));
  return combination * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function poissonProbability(k: number, lambda: number): number {
  const numerator = Math.pow(lambda, k) * Math.exp(-lambda);
  const denominator = factorial(k);
  return numerator / denominator;
}

export function exponentialPDF(x: number, lambda: number): number {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

export function uniformPDF(x: number, a: number, b: number): number {
  if (x < a || x > b) return 0;
  return 1 / (b - a);
}

export function kullbackLeiblerDivergence(p: number[], q: number[]): number {
  if (p.length !== q.length) return 0;
  
  return p.reduce((sum, pi, i) => {
    if (pi === 0 || q[i] === 0) return sum;
    return sum + pi * Math.log(pi / q[i]);
  }, 0);
}

export function jensenShannonDivergence(p: number[], q: number[]): number {
  if (p.length !== q.length) return 0;
  
  const m = p.map((pi, i) => (pi + q[i]) / 2);
  const dpm = kullbackLeiblerDivergence(p, m);
  const dqm = kullbackLeiblerDivergence(q, m);
  
  return (dpm + dqm) / 2;
}

export function wasserstein1D(p: number[], q: number[]): number {
  if (p.length !== q.length) return 0;
  
  const sorted_p = [...p].sort((a, b) => a - b);
  const sorted_q = [...q].sort((a, b) => a - b);
  
  return sorted_p.reduce((sum, val, i) => sum + Math.abs(val - sorted_q[i]), 0) / sorted_p.length;
}

export function hellingerDistance(p: number[], q: number[]): number {
  if (p.length !== q.length) return 0;
  
  const sum = p.reduce((s, pi, i) => s + Math.pow(Math.sqrt(pi) - Math.sqrt(q[i]), 2), 0);
  return Math.sqrt(sum / 2);
}

function factorial(n: number): number {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

export function confidenceInterval(mean: number, stdDev: number, n: number, confidence: number = 0.95): [number, number] {
  const z = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.96;
  const margin = z * (stdDev / Math.sqrt(n));
  return [mean - margin, mean + margin];
}

export function probabilityDensityEstimate(data: number[]): Record<number, number> {
  const bandwidth = 1.06 * calculateStdDev(data) * Math.pow(data.length, -1/5);
  const pdf: Record<number, number> = {};
  
  for (let i = -5; i <= 5; i += 0.5) {
    let density = 0;
    for (const point of data) {
      const kernel = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow((i - point) / bandwidth, 2));
      density += kernel;
    }
    pdf[i] = density / data.length;
  }
  
  return pdf;
}
