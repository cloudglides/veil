import { getWasmModule } from "../wasm-loader";
import { seededRng } from "../seeded-rng";

export async function getApproximateEntropy(seed: string): Promise<string> {
  const samples = seededRng(seed, 256);
  const wasm = await getWasmModule();
  const apen = wasm.approx_entropy(new Float64Array(samples), 2);
  return `apen:${apen.toFixed(6)}`;
}
