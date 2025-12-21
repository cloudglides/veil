import { approx_entropy } from "./veil_core.js";

export async function getApproximateEntropy(): Promise<string> {
  const samples = Array(256).fill(0).map(() => Math.random());
  const apen = approx_entropy(new Float64Array(samples), 2);
  return `apen:${apen.toFixed(6)}`;
}
