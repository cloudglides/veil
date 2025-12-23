import { getWasmModule } from "../wasm-loader";

export async function getComplexityEntropy(): Promise<string> {
  const ua = navigator.userAgent;
  const bytes = new Uint8Array(ua.length);
  
  for (let i = 0; i < ua.length; i++) {
    bytes[i] = ua.charCodeAt(i) % 256;
  }

  const wasm = await getWasmModule();
  const complexity = wasm.lz_complexity(bytes);
  return `lz:${complexity}`;
}
