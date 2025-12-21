export async function getPluginsEntropy(): Promise<string> {
  const plugins = Array.from(navigator.plugins)
    .map((p) => p.name)
    .join(",");
  return plugins || "none";
}
