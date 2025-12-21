let wasmInitialized = false;

export async function initializeWasm() {
  if (wasmInitialized) return;

  try {
    const wasmModule = await import("./veil_core.js");
    await wasmModule.default();
    wasmInitialized = true;
  } catch (error) {
    console.error("Failed to initialize WASM module:", error);
    throw error;
  }
}
