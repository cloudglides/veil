export async function runGPUBenchmark(): Promise<{
  renderTime: number;
  textureOps: number;
  shaderPerformance: number;
}> {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
  if (!gl) {
    return { renderTime: 0, textureOps: 0, shaderPerformance: 0 };
  }

  const start = performance.now();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) return { renderTime: 0, textureOps: 0, shaderPerformance: 0 };
  
  gl.shaderSource(
    vertexShader,
    `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `,
  );
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) return { renderTime: 0, textureOps: 0, shaderPerformance: 0 };
  
  gl.shaderSource(
    fragmentShader,
    `
    precision highp float;
    uniform sampler2D tex;
    void main() {
      gl_FragColor = texture2D(tex, vec2(0.5, 0.5));
    }
  `,
  );
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  if (!program) return { renderTime: 0, textureOps: 0, shaderPerformance: 0 };
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    256,
    256,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array(256 * 256 * 4).fill(128),
  );

  for (let i = 0; i < 100; i++) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

  const renderTime = performance.now() - start;

  const textureOps = 100;
  const shaderPerformance = 512 * 512 * 100 / (renderTime || 1);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.deleteProgram(program);
  gl.deleteBuffer(positionBuffer);
  gl.deleteTexture(texture);

  canvas.remove();

  return {
    renderTime,
    textureOps,
    shaderPerformance,
  };
}

export async function getGPUHash(): Promise<string> {
  const benchmark = await runGPUBenchmark();
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  for (let i = 0; i < 256; i++) {
    for (let j = 0; j < 256; j++) {
      const hue = (benchmark.renderTime * (i + j)) % 360;
      const sat = (benchmark.shaderPerformance * i) % 100;
      const lum = (benchmark.textureOps * j) % 100;

      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${lum}%)`;
      ctx.fillRect(i, j, 1, 1);
    }
  }

  const imageData = ctx.getImageData(0, 0, 256, 256);
  const data = imageData.data;

  let hash = 0;
  for (let i = 0; i < data.length; i += 4) {
    hash ^= ((data[i] + data[i + 1] + data[i + 2]) * (i * 1)) >> 0;
  }

  return hash.toString(16);
}
