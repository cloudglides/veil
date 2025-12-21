async function detectAdblock(): Promise<boolean> {
  try {
    const response = await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
      method: "HEAD",
      mode: "no-cors",
    });
    return false;
  } catch {
    return true;
  }
}

export async function getAdblockEntropy(): Promise<string> {
  const adblockPresent = await detectAdblock();
  return `adblock:${adblockPresent}`;
}
