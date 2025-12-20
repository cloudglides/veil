export async function getUserAgentEntropy(): Promise<string> {
  return navigator.userAgent;
}
