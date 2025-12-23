let wasmInitialized = false;
let wasmModule: any = null;

async function loadWasmModule() {
  if (wasmModule) return wasmModule;

  const paths = [
    () => import("./veil_core.js"),
    () => import("../veil-core/pkg/veil_core.js"),
  ];

  for (const pathFn of paths) {
    try {
      wasmModule = await pathFn();
      return wasmModule;
    } catch {
      continue;
    }
  }

  throw new Error("Failed to load WASM module from any location");
}

export async function initializeWasm() {
  if (wasmInitialized) return;

  try {
    const wasm = await loadWasmModule();
    if (typeof wasm.default === "function") {
      await wasm.default();
    }
    wasmInitialized = true;
  } catch (error) {
    console.error("Failed to initialize WASM module:", error);
    throw error;
  }
}

export async function getWasmModule() {
  if (!wasmInitialized) {
    await initializeWasm();
  }
  return wasmModule;
}
