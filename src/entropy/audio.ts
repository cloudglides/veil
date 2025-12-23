export async function getAudioEntropy(): Promise<string> {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const state = ctx.state;
    const sampleRate = ctx.sampleRate;

    const bitDepth = 32;
    const nyquistFreq = sampleRate / 2;
    const frequencyBits = Math.log2(nyquistFreq + 1);
    const audioCapacity = bitDepth * sampleRate;

    ctx.close();
    return `state:${state}|sr:${sampleRate}|f_nyquist:${nyquistFreq}|H(audio)=${frequencyBits.toFixed(3)}`;
  } catch {
    return "audio:unavailable";
  }
}
