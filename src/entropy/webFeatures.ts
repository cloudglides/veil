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
  return Object.entries(features)
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}
