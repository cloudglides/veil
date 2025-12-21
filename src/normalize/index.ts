export function normalizeScreen(width: number, height: number): string {
  const bucketSize = 100;
  const bw = Math.floor(width / bucketSize) * bucketSize;
  const bh = Math.floor(height / bucketSize) * bucketSize;
  return `${bw}x${bh}`;
}

export function normalizeTimezone(tz: string): string {
  return tz.split("/")[0];
}

export function normalizeUserAgent(ua: string): string {
  const parts = ua.split(" ");
  return parts.slice(0, 3).join(" ");
}

export function normalizeFloat(num: number, decimals: number = 10): string {
  return num.toFixed(decimals);
}

export function normalizeCanvas(dataUrl: string): string {
  return dataUrl.substring(0, 100);
}

export function normalizeStorage(storageStr: string): string {
  const [localStorage, indexedDB] = storageStr.split("|");
  const ls = localStorage.includes("true") ? "1" : "0";
  const idb = indexedDB.includes("true") ? "1" : "0";

  return `${ls}${idb}`;
}
