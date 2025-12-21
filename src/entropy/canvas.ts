export async function getCanvasEntropy(): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 60;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "canvas:unavailable";

    ctx.textBaseline = "top";
    ctx.font = "69px 'Palatino Linotype'";
    ctx.textRendering = "geometricPrecision";
    ctx.fillText("Browser fingerprint", 2, 15);
    ctx.fillStyle = "rgb(102, 205, 0)";
    ctx.fillRect(125, 1, 62, 20);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let hash = 0;
    for (let i = 0; i < data.length; i += 4) {
      hash ^= ((data[i] + data[i + 1] + data[i + 2]) * (i * 1)) >> 0;
    }

    return hash === 0 ? "canvas:blank" : hash.toString(16);
  } catch {
    return "canvas:unavailable";
  }
}
