import { spectral } from "./veil_core.js";

export async function getSpectralEntropy(): Promise<string> {
  const samples = Array(128).fill(0).map(() => Math.random());
  const entropy = spectral(new Float64Array(samples));
  return `spectral:${entropy.toFixed(6)}`;
}
