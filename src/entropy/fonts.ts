export async function getFontsEntropy(): Promise<string> {
  const fonts = ["Arial", "Courier", "Georgia", "Verdana"];
  return fonts.join(",");
}
