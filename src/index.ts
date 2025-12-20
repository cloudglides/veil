import { FingerprintOptions } from "./types";
import { getUserAgentEntropy } from "./entropy/userAgent";
import { getCanvasEntropy } from "./entropy/canvas";
import { getWebGLEntropy } from "./entropy/webgl";
import { getFontsEntropy } from "./entropy/fonts";
import { getStorageEntropy } from "./entropy/storage";
import { getScreenEntropy } from "./entropy/screen";
import {
  murmur_hash,
  fnv_hash,
  shannon_entropy,
  kolmogorov_complexity,
} from "../veil-core/pkg/veil_core.js";

export async function getFingerprint(
  options?: FingerprintOptions,
): Promise<string> {
  const opts = {
    entropy: {},
    hash: "sha256",
    ...options,
  };

  const data: string[] = [];

  if (opts.entropy.userAgent !== false) {
    data.push(await getUserAgentEntropy());
  }

  if (opts.entropy.canvas !== false) {
    data.push(await getCanvasEntropy());
  }

  if (opts.entropy.webgl !== false) {
    data.push(await getWebGLEntropy());
  }

  if (opts.entropy.fonts !== false) {
    data.push(await getFontsEntropy());
  }

  if (opts.entropy.storage !== false) {
    data.push(await getStorageEntropy());
  }

  if (opts.entropy.screen !== false) {
    data.push(await getScreenEntropy());
  }

  const dataStr = data.join("|");
  const shannon = shannon_entropy(dataStr);
  const kolmogorov = kolmogorov_complexity(dataStr);
  const murmur = murmur_hash(dataStr);
  const fnv = fnv_hash(dataStr);

  const mathMetrics = `${shannon}|${kolmogorov}|${murmur}|${fnv}`;
  const combined = dataStr + "|" + mathMetrics;

  const algorithm = opts.hash === "sha512" ? "SHA-512" : "SHA-256";
  const hash = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(combined),
  );

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type { FingerprintOptions } from "./types";
