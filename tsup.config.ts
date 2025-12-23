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
  external: ["./veil_core.js", "../veil-core/pkg/veil_core.js"],
  noExternal: [],
  splitting: true,
  onSuccess: async () => {
    const srcWasmDir = resolve("veil-core/pkg");
    const distDir = resolve("dist");
    const exampleDir = resolve("example");

    await mkdir(distDir, { recursive: true });
    await mkdir(exampleDir, { recursive: true });

    for (const dir of [distDir, exampleDir]) {
      await cp(`${srcWasmDir}/veil_core_bg.wasm`, `${dir}/veil_core_bg.wasm`);
      await cp(`${srcWasmDir}/veil_core.js`, `${dir}/veil_core.js`);
      await cp(`${srcWasmDir}/veil_core.d.ts`, `${dir}/veil_core.d.ts`);
      await cp(
        `${srcWasmDir}/veil_core_bg.wasm.d.ts`,
        `${dir}/veil_core_bg.wasm.d.ts`,
      );

      let wasmContent = readFileSync(`${dir}/veil_core.js`, "utf-8");
      wasmContent = wasmContent.replace(
        /module_or_path = new URL\('veil_core_bg\.wasm', import\.meta\.url\);/g,
        "module_or_path = new URL('veil_core_bg.wasm', import.meta.url).href;",
      );
      writeFileSync(`${dir}/veil_core.js`, wasmContent);
    }
  },
});
