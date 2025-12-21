export async function getScreenEntropy(): Promise<string> {
  return `${screen.width}x${screen.height}|${screen.colorDepth}`;
}
