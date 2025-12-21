export async function getUserAgentEntropy(): Promise<string> {
  const ua = navigator.userAgent;
  
  let entropy = 0;
  const freq: Record<string, number> = {};
  for (const char of ua) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  for (const count of Object.values(freq)) {
    const p = count / ua.length;
    entropy -= p * Math.log2(p);
  }
  
  return `${ua}|H(UA)=${entropy.toFixed(4)}`;
}
