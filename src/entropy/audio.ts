export async function getAudioEntropy(): Promise<string> {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const state = ctx.state;
    const sampleRate = ctx.sampleRate;
    ctx.close();
    return `state:${state}|sample:${sampleRate}`;
  } catch {
    return "audio:unavailable";
  }
}
