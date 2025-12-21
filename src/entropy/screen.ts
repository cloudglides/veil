export async function getScreenEntropy(): Promise<string> {
  const w = screen.width;
  const h = screen.height;
  const d = screen.colorDepth;
  
  const pixelCount = w * h;
  const totalColors = Math.pow(2, d);
  const colorSpace = Math.log2(totalColors);
  const screenSurface = Math.log2(pixelCount);
  
  return `${w}x${h}|colors:${d}|log₂(A)=${screenSurface.toFixed(2)}|log₂(C)=${colorSpace.toFixed(2)}`;
}
