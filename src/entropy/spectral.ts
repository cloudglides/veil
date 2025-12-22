import { spectral } from "./veil_core.js";
import { seededRng } from "../seeded-rng";

export async function getSpectralEntropy(seed: string): Promise<string> {
  const samples = seededRng(seed, 128);
  const entropy = spectral(new Float64Array(samples));
  return `spectral:${entropy.toFixed(6)}`;
}
