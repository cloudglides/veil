export async function getLanguageEntropy(): Promise<string> {
  const language = navigator.language;
  const languages = navigator.languages.join(",");
  return `${language}|${languages}`;
}
