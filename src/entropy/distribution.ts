import { ks_test } from "./veil_core.js";

export async function getDistributionEntropy(): Promise<string> {
  const samples = Array(1000).fill(0).map(() => Math.random());
  const ksStatistic = ks_test(new Float64Array(samples));
  return `ks:${ksStatistic.toFixed(6)}`;
}
