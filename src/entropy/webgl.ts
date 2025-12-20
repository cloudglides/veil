export async function getWebGLEntropy(): Promise<string> {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl");
  if (!gl) return "";

  return `${gl.getParameter(gl.RENDERER)}|${gl.getParameter(gl.VENDOR)}`;
}
