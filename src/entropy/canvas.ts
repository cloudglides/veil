export async function getCanvasEntropy(): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "rgb(200,50,50)";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "rgb(55,135,500)";
  ctx.font = "17px Arial";
  ctx.fillText("veil", 2, 15);

  return canvas.toDataURL();
}
