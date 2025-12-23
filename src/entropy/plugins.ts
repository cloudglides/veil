export async function getPluginsEntropy(): Promise<string> {
  const plugins = Array.from(navigator.plugins).map((p) => p.name);
  const pluginStr = plugins.join("|");

  const pluginCount = plugins.length;
  const pluginEntropy = pluginCount > 0 
    ? -plugins.reduce((h, p) => {
        const p_freq = 1 / pluginCount;
        return h + p_freq * Math.log2(p_freq);
      }, 0)
    : 0;

  return `count:${pluginCount}|H(plugins)=${pluginEntropy.toFixed(3)}|plugins:${pluginStr || "none"}`;
}
