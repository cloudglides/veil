export async function getScreenInfoEntropy(): Promise<string> {
  const width = screen.width;
  const height = screen.height;
  const depth = screen.colorDepth;
  const pixelDepth = screen.pixelDepth;
  const devicePixelRatio = window.devicePixelRatio;
  return `${width}x${height}|depth:${depth}|px:${pixelDepth}|ratio:${devicePixelRatio}`;
}
