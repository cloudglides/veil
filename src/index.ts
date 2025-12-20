import { FingerprintOptions } from "./types/index.ts";
import { getUserAgentEntropy } from "./entropy/userAgent.ts";
import { getCanvasEntropy } from "./entropy/canvas.ts";
import { getWebGLEntropy } from "./entropy/webgl.ts";
import { getFontsEntropy } from "./entropy/fonts.ts";
import { getStorageEntropy } from "./entropy/storage.ts";
import { getScreenEntropy } from "./entropy/screen.ts";
import { murmurHash, entropyValue } from "./math/hash.ts";

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
  const dataEntropy = entropyValue(data);
  const mathHash = murmurHash(dataStr + dataEntropy.toString());

  const algorithm = opts.hash === "sha512" ? "SHA-512" : "SHA-256";
  const hash = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(dataStr + "|" + mathHash),
  );

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type { FingerprintOptions } from "./types/index.ts";
