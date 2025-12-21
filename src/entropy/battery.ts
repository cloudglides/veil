export async function getBatteryEntropy(): Promise<string> {
  const nav = navigator as any;
  if (!nav.getBattery) return "battery:unavailable";
  try {
    const battery = await nav.getBattery();
    return `level:${battery.level}|charging:${battery.charging}`;
  } catch {
    return "battery:unavailable";
  }
}
