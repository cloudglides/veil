export async function getOSEntropy(): Promise<string> {
  const platform = navigator.platform || "unknown";
  const oscpu = (navigator as any).oscpu || "unknown";
  const combined = platform + oscpu;

  const uniqueChars = new Set(combined).size;
  const totalChars = combined.length;
  const charDiversity = uniqueChars / totalChars;
  const surprisal = -Math.log2(1 / uniqueChars);

  return `OS:${platform}|CPU:${oscpu}|δ=${charDiversity.toFixed(4)}|I=${surprisal.toFixed(2)}`;
}
