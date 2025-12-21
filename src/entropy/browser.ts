export async function getBrowserEntropy(): Promise<string> {
  const ua = navigator.userAgent;
  const vendor = navigator.vendor;
  const cookieEnabled = navigator.cookieEnabled;
  const doNotTrack = navigator.doNotTrack;
  return `ua:${ua}|vendor:${vendor}|cookies:${cookieEnabled}|dnt:${doNotTrack}`;
}
