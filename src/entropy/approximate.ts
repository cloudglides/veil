import { approx_entropy } from "../../veil-core/pkg/veil_core.js";
import { seededRng } from "../seeded-rng";

export async function getApproximateEntropy(seed: string): Promise<string> {
  const samples = seededRng(seed, 256);
  const apen = approx_entropy(new Float64Array(samples), 2);
  return `apen:${apen.toFixed(6)}`;
}
