export async function getLanguageEntropy(): Promise<string> {
  const language = navigator.language;
  const languages = navigator.languages;
  
  const langCount = languages.length;
  const langDiversity = Math.log2(langCount + 1);
  const primaryEntropy = -Array.from(language).reduce((h, c) => {
    const p = 1 / language.length;
    return h + p * Math.log2(p);
  }, 0);
  
  const combined = languages.join("|");
  return `primary:${language}|langs:${langCount}|H(L)=${primaryEntropy.toFixed(3)}|D=${langDiversity.toFixed(3)}`;
}
