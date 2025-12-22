export async function getWebGLEntropy(): Promise<string> {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("webgl2");
  if (!gl) return "webgl:unavailable";

  const vendor = gl.getParameter(gl.VENDOR) || "unknown";
  const renderer = gl.getParameter(gl.RENDERER) || "unknown";
  const version = gl.getParameter(gl.VERSION) || "unknown";
  
  return `vendor:${vendor}|renderer:${renderer}|version:${version}`;
}
