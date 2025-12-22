import { ks_test } from "./veil_core.js";
import { seededRng } from "../seeded-rng";

export async function getDistributionEntropy(seed: string): Promise<string> {
  const samples = seededRng(seed, 1000);
  const ksStatistic = ks_test(new Float64Array(samples));
  return `ks:${ksStatistic.toFixed(6)}`;
}
