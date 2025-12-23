import { getWasmModule } from "../wasm-loader";
import { seededRng } from "../seeded-rng";

export async function getDistributionEntropy(seed: string): Promise<string> {
  const samples = seededRng(seed, 1000);
  const wasm = await getWasmModule();
  const ksStatistic = wasm.ks_test(new Float64Array(samples));
  return `ks:${ksStatistic.toFixed(6)}`;
}
