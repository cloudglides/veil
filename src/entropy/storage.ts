export async function getStorageEntropy(): Promise<string> {
  return `localStorage:${!!window.localStorage}|indexedDB:${!!window.indexedDB}`;
}
