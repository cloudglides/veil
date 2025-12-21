import { readFileSync, writeFileSync } from "fs";

const wasmFile = "dist/veil_core.js";
let content = readFileSync(wasmFile, "utf-8");

content = content.replace(
  "module_or_path = new URL('veil_core_bg.wasm', import.meta.url);",
  "module_or_path = new URL('veil_core_bg.wasm', import.meta.url).href;",
);

writeFileSync(wasmFile, content);
console.log("Patched veil_core.js for browser compatibility");
