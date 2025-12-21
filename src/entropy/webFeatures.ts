export async function getWebFeaturesEntropy(): Promise<string> {
  const features = {
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    openDatabase: !!(window as any).openDatabase,
    serviceWorker: !!navigator.serviceWorker,
    webWorker: typeof Worker !== "undefined",
    geolocation: !!navigator.geolocation,
    notifications: !!window.Notification,
  };
  
  const enabled = Object.values(features).filter(Boolean).length;
  const total = Object.keys(features).length;
  const supportRatio = enabled / total;
  const supportEntropy = Math.log2(total) * (1 - Math.abs(supportRatio - 0.5) * 2);
  
  return `enabled:${enabled}/${total}|σ=${supportRatio.toFixed(3)}|H(features)=${supportEntropy.toFixed(3)}|${Object.entries(features)
    .map(([k, v]) => `${k}:${v}`)
    .join("|")}`;
}
