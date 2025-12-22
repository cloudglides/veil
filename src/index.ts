import type { FingerprintOptions, FingerprintResponse, SourceMetric } from "./types";
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
import { getPermissionsEntropy } from "./entropy/permissions";
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
import { scoreFingerprint, calculateEntropy, type EntropySource } from "./scoring";
import { getGPUHash, runGPUBenchmark } from "./gpu";
import { getCPUHash, runCPUBenchmark } from "./cpu";
import { seededRng } from "./seeded-rng";

export async function getFingerprint(
  options?: FingerprintOptions,
): Promise<string | FingerprintResponse> {
  await initializeWasm();

  const opts = {
    entropy: {},
    hash: "sha256",
    ...options,
  };

  const sources: EntropySource[] = [];

  if (opts.entropy.userAgent !== false) {
    const value = await getUserAgentEntropy();
    sources.push({ name: "userAgent", value, entropy: calculateEntropy(value) });
  }

  if (opts.entropy.canvas !== false) {
    const value = await getCanvasEntropy();
    sources.push({ name: "canvas", value, entropy: calculateEntropy(value) });
  }

  if (opts.entropy.webgl !== false) {
    const value = await getWebGLEntropy();
    sources.push({ name: "webgl", value, entropy: calculateEntropy(value) });
  }

  if (opts.entropy.fonts !== false) {
    const value = await getFontsEntropy();
    sources.push({ name: "fonts", value, entropy: calculateEntropy(value) });
  }

  if (opts.entropy.storage !== false) {
    const value = await getStorageEntropy();
    sources.push({ name: "storage", value, entropy: calculateEntropy(value) });
  }

  if (opts.entropy.screen !== false) {
    const value = await getScreenEntropy();
    sources.push({ name: "screen", value, entropy: calculateEntropy(value) });
  }

  const baseSeed = sources.map(s => s.value).join("|");
  
  sources.push({ name: "distribution", value: await getDistributionEntropy(baseSeed), entropy: 0 });
  sources.push({ name: "complexity", value: await getComplexityEntropy(), entropy: 0 });
  sources.push({ name: "spectral", value: await getSpectralEntropy(baseSeed), entropy: 0 });
  sources.push({ name: "approximate", value: await getApproximateEntropy(baseSeed), entropy: 0 });
  sources.push({ name: "os", value: await getOSEntropy(), entropy: 0 });
  sources.push({ name: "language", value: await getLanguageEntropy(), entropy: 0 });
  sources.push({ name: "timezone", value: await getTimezoneEntropy(), entropy: 0 });
  sources.push({ name: "hardware", value: await getHardwareEntropy(), entropy: 0 });
  sources.push({ name: "plugins", value: await getPluginsEntropy(), entropy: 0 });
  sources.push({ name: "browser", value: await getBrowserEntropy(), entropy: 0 });
  sources.push({ name: "osVersion", value: await getOSVersionEntropy(), entropy: 0 });
  sources.push({ name: "screenInfo", value: await getScreenInfoEntropy(), entropy: 0 });
  sources.push({ name: "adblock", value: await getAdblockEntropy(), entropy: 0 });
  sources.push({ name: "webFeatures", value: await getWebFeaturesEntropy(), entropy: 0 });
  sources.push({ name: "preferences", value: await getPreferencesEntropy(), entropy: 0 });
  sources.push({ name: "permissions", value: await getPermissionsEntropy(), entropy: 0 });
  sources.push({ name: "statistical", value: await getStatisticalEntropy(), entropy: 0 });
  sources.push({ name: "probabilistic", value: await getProbabilisticEntropy(), entropy: 0 });

  for (const source of sources) {
    if (source.entropy === 0) {
      source.entropy = calculateEntropy(source.value);
    }
  }

  const score = scoreFingerprint(sources);

  const data = sources.map(s => s.value);

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

  let fingerprint = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (opts.gpuBenchmark) {
    const gpuHash = await getGPUHash();
    fingerprint = Array.from(new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprint + gpuHash))
    ))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  if (opts.cpuBenchmark) {
    const cpuHash = await getCPUHash();
    fingerprint = Array.from(new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprint + cpuHash))
    ))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  if (opts.detailed) {
    const os = await getOSVersionEntropy();
    const lang = await getLanguageEntropy();
    const tz = await getTimezoneEntropy();
    const hw = await getHardwareEntropy();
    const sr = await getScreenInfoEntropy();
    const ua = await getUserAgentEntropy();
    const browser = await getBrowserEntropy();

    const sourceMetrics: SourceMetric[] = sources.map(s => ({
      source: s.name,
      value: s.value,
      entropy: s.entropy,
      confidence: score.likelihood > 0 ? Math.min(s.entropy / score.likelihood, 1) : 0,
    }));

    const response: FingerprintResponse = {
      hash: fingerprint,
      uniqueness: score.uniqueness,
      confidence: score.confidence,
      sources: sourceMetrics,
      system: {
        os,
        language: lang.split("|")[0],
        timezone: tz.split("|")[0],
        hardware: {
          cores: navigator.hardwareConcurrency || 0,
          memory: (navigator as any).deviceMemory || 0,
        },
      },
      display: {
        resolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        devicePixelRatio: window.devicePixelRatio,
      },
      browser: {
        userAgent: navigator.userAgent,
        vendor: navigator.vendor,
        cookieEnabled: navigator.cookieEnabled,
      },
    };

    return response;
  }

  return fingerprint;
}

export type { FingerprintOptions, FingerprintResponse } from "./types";
