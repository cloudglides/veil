export async function getPreferencesEntropy(): Promise<string> {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const highContrast = window.matchMedia("(prefers-contrast: more)").matches;
  
  const prefCount = [darkMode, reducedMotion, highContrast].filter(Boolean).length;
  const maxCombinations = Math.pow(2, 3);
  const preferenceBits = Math.log2(maxCombinations);
  const actualEntropy = prefCount > 0 ? -((prefCount / 3) * Math.log2(prefCount / 3) + ((3 - prefCount) / 3) * Math.log2((3 - prefCount) / 3)) : 0;
  
  return `dark:${darkMode}|motion:${reducedMotion}|contrast:${highContrast}|enabled:${prefCount}|H(pref)=${actualEntropy.toFixed(3)}`;
}
