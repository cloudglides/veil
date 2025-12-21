export async function getWebGLEntropy(): Promise<string> {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
  if (!gl) return "webgl:unavailable";

  const vendor = gl.getParameter(gl.VENDOR) || "unknown";
  const renderer = gl.getParameter(gl.RENDERER) || "unknown";
  
  const vendorEntropy = -Array.from(vendor).reduce((h, c) => {
    const p = 1 / vendor.length;
    return h + p * Math.log2(p);
  }, 0);

  return `webgl:${vendor}|${renderer}|H(V)=${vendorEntropy.toFixed(4)}`;
}
