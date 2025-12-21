export async function getPreferencesEntropy(): Promise<string> {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const highContrast = window.matchMedia("(prefers-contrast: more)").matches;
  return `dark:${darkMode}|motion:${reducedMotion}|contrast:${highContrast}`;
}
