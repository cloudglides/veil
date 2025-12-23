import { defineConfig } from "tsup";
import { cp, mkdir } from "fs/promises";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  shims: true,
  outDir: "dist",
  external: [],
  onSuccess: async () => {
    const srcWasmDir = resolve("veil-core/pkg");
    const distDir = resolve("dist");

    await mkdir(distDir, { recursive: true });

    await cp(`${srcWasmDir}/veil_core_bg.wasm`, `${distDir}/veil_core_bg.wasm`);
    await cp(`${srcWasmDir}/veil_core.js`, `${distDir}/veil_core.js`);
    await cp(`${srcWasmDir}/veil_core.d.ts`, `${distDir}/veil_core.d.ts`);
    await cp(
      `${srcWasmDir}/veil_core_bg.wasm.d.ts`,
      `${distDir}/veil_core_bg.wasm.d.ts`,
    );

    let wasmContent = readFileSync(`${distDir}/veil_core.js`, "utf-8");
    wasmContent = wasmContent.replace(
      /module_or_path = new URL\('veil_core_bg\.wasm', import\.meta\.url\);/g,
      "module_or_path = new URL('veil_core_bg.wasm', import.meta.url).href;",
    );
    writeFileSync(`${distDir}/veil_core.js`, wasmContent);
  },
});
