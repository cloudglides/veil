export async function getTimezoneEntropy(): Promise<string> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  return `${tz}|${offset}`;
}
