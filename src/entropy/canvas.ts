export async function getCanvasEntropy(): Promise<string> {
  try {
    const canvas = document.createElement("canvas");
    if (canvas.getContext === undefined) return "canvas:unavailable";

    const ctx = canvas.getContext("2d");
    if (!ctx) return "canvas:unavailable";

    const support = ctx.fillText ? "fillText" : "none";
    const textMetrics = ctx.measureText ? "measureText" : "none";
    const imageDataSupport = ctx.getImageData ? "getImageData" : "none";

    return `support:${support}|metrics:${textMetrics}|imageData:${imageDataSupport}`;
  } catch {
    return "canvas:unavailable";
  }
}
