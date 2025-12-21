export async function getTimezoneEntropy(): Promise<string> {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  
  const tzEntropy = Math.log2(Math.abs(offset) + 1);
  const offsetBits = offset.toString().length * 8;
  const tzUniqueness = Math.log2(24 * 60 / Math.max(Math.abs(offset), 1));
  
  return `TZ:${tz}|offset:${offset}|H(TZ)=${tzEntropy.toFixed(3)}|U=${tzUniqueness.toFixed(3)}`;
}
