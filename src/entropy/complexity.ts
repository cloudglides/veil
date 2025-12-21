import { lz_complexity } from "./veil_core.js";

export async function getComplexityEntropy(): Promise<string> {
  const data = new Uint8Array(256);
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "lz:unavailable";

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillStyle = "black";
  for (let i = 0; i < 50; i++) {
    ctx.fillRect(Math.random() * 16, Math.random() * 16, 2, 2);
  }

  const imgData = ctx.getImageData(0, 0, 16, 16);
  for (let i = 0; i < 256; i++) {
    data[i] = imgData.data[i * 4] > 128 ? 1 : 0;
  }

  const complexity = lz_complexity(data);
  return `lz:${complexity}`;
}
