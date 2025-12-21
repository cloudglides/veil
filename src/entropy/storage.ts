export async function getStorageEntropy(): Promise<string> {
  let ls = false;
  let idb = false;

  try {
    const test = "__storage_test__";
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    ls = true;
  } catch {
    ls = false;
  }

  try {
    const request = window.indexedDB.open("__idb_test__");
    idb = true;
  } catch {
    idb = false;
  }

  return `localStorage:${ls}|indexedDB:${idb}`;
}
