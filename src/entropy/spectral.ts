import { getWasmModule } from "../wasm-loader";
import { seededRng } from "../seeded-rng";

export async function getSpectralEntropy(seed: string): Promise<string> {
  const samples = seededRng(seed, 128);
  const wasm = await getWasmModule();
  const entropy = wasm.spectral(new Float64Array(samples));
  return `spectral:${entropy.toFixed(6)}`;
}
