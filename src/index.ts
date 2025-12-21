import { FingerprintOptions } from "./types";
import { getUserAgentEntropy } from "./entropy/userAgent";
import { getCanvasEntropy } from "./entropy/canvas";
import { getWebGLEntropy } from "./entropy/webgl";
import { getFontsEntropy } from "./entropy/fonts";
import { getStorageEntropy } from "./entropy/storage";
import { getScreenEntropy } from "./entropy/screen";
import { getDistributionEntropy } from "./entropy/distribution";
import { getComplexityEntropy } from "./entropy/complexity";
import { getSpectralEntropy } from "./entropy/spectral";
import { getApproximateEntropy } from "./entropy/approximate";
import { getOSEntropy } from "./entropy/os";
import { getLanguageEntropy } from "./entropy/language";
import { getTimezoneEntropy } from "./entropy/timezone";
import { getHardwareEntropy } from "./entropy/hardware";
import { getPluginsEntropy } from "./entropy/plugins";
import { getBrowserEntropy } from "./entropy/browser";
import { getOSVersionEntropy } from "./entropy/osVersion";
import { getScreenInfoEntropy } from "./entropy/screenInfo";
import { getAdblockEntropy } from "./entropy/adblock";
import { getWebFeaturesEntropy } from "./entropy/webFeatures";
import { getPreferencesEntropy } from "./entropy/preferences";
import { getConnectionEntropy } from "./entropy/connection";
import { getAudioEntropy } from "./entropy/audio";
import { getBatteryEntropy } from "./entropy/battery";
import { getPermissionsEntropy } from "./entropy/permissions";
import { getPerformanceEntropy } from "./entropy/performance";
import { getStatisticalEntropy } from "./entropy/statistical";
import { getProbabilisticEntropy } from "./entropy/probabilistic";
import {
  murmur_hash,
  fnv_hash,
  shannon_entropy,
  kolmogorov_complexity,
} from "./veil_core.js";
import * as normalize from "./normalize";
import { initializeWasm } from "./wasm-loader";

export async function getFingerprint(
  options?: FingerprintOptions,
): Promise<string> {
  await initializeWasm();

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

  data.push(await getDistributionEntropy());
  data.push(await getComplexityEntropy());
  data.push(await getSpectralEntropy());
  data.push(await getApproximateEntropy());
  data.push(await getOSEntropy());
  data.push(await getLanguageEntropy());
  data.push(await getTimezoneEntropy());
  data.push(await getHardwareEntropy());
  data.push(await getPluginsEntropy());
  data.push(await getBrowserEntropy());
  data.push(await getOSVersionEntropy());
  data.push(await getScreenInfoEntropy());
  data.push(await getAdblockEntropy());
  data.push(await getWebFeaturesEntropy());
  data.push(await getPreferencesEntropy());
  data.push(await getConnectionEntropy());
  data.push(await getAudioEntropy());
  data.push(await getBatteryEntropy());
  data.push(await getPermissionsEntropy());
  data.push(await getPerformanceEntropy());
  data.push(await getStatisticalEntropy());
  data.push(await getProbabilisticEntropy());

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
