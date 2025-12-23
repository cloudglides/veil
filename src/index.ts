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
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[len1][len2];
}

function similarityScore(s1: string, s2: string): number {
  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}

import * as normalize from "./normalize";
import { initializeWasm } from "./wasm-loader";
import { scoreFingerprint, calculateEntropy, type EntropySource } from "./scoring";
import { analyzeTamper } from "./tamper";
import { getSourceStability, assessFingerprint, generateDeviceIdentity } from "./stability";

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
  const tamper = analyzeTamper(sources);
  const stability = getSourceStability(sources);
  const assessment = assessFingerprint(sources);

  const deviceIdentity = generateDeviceIdentity(sources);

  const data = sources.map(s => s.value);
  const combined = data.join("|");

  const coreWeight = "core:" + deviceIdentity.core_hash;
  const prefsWeight = "prefs:" + deviceIdentity.preferences_hash;
  const weightedInput = `${coreWeight}|${prefsWeight}|${combined}`;

  const algorithm = opts.hash === "sha512" ? "SHA-512" : "SHA-256";
  const hash = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(weightedInput),
  );

  let fingerprint = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (opts.detailed) {
    const os = await getOSVersionEntropy();
    const lang = await getLanguageEntropy();
    const tz = await getTimezoneEntropy();
    const hw = await getHardwareEntropy();
    const sr = await getScreenInfoEntropy();
    const ua = await getUserAgentEntropy();
    const browser = await getBrowserEntropy();

    const sourceMetrics: SourceMetric[] = sources.map(s => {
      const stab = stability.find(st => st.source === s.name);
      return {
        source: s.name,
        value: s.value,
        entropy: s.entropy,
        confidence: score.likelihood > 0 ? Math.min(s.entropy / score.likelihood, 1) : 0,
        stability: stab?.stability,
      };
    });

    const avgStability = stability.length > 0
      ? stability.reduce((a, b) => a + b.stability, 0) / stability.length
      : 0;

    const response: FingerprintResponse = {
      hash: fingerprint,
      uniqueness: score.uniqueness,
      confidence: score.confidence,
      stability_score: avgStability,
      usable: assessment.usable,
      warnings: assessment.warnings.length > 0 ? assessment.warnings : undefined,
      entropy_warnings: assessment.entropy_warnings.length > 0 ? assessment.entropy_warnings : undefined,
      tampering_risk: tamper.tampering_risk,
      anomalies: tamper.anomalies,
      device_identity: deviceIdentity,
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

export async function compareFingerpints(
  fp1: string | FingerprintResponse,
  fp2: string | FingerprintResponse,
): Promise<{ similarity: number; match: boolean }> {
  const hash1 = typeof fp1 === "string" ? fp1 : fp1.hash;
  const hash2 = typeof fp2 === "string" ? fp2 : fp2.hash;

  const sim = similarityScore(hash1, hash2);
  const match = sim > 0.95;

  return { similarity: sim, match };
}

export async function matchProbability(
  storedFingerprints: (string | FingerprintResponse)[],
  currentFingerprint: string | FingerprintResponse,
): Promise<{ bestMatch: number; confidence: number }> {
  const currentHash = typeof currentFingerprint === "string" ? currentFingerprint : currentFingerprint.hash;
  
  let bestMatch = 0;
  for (const stored of storedFingerprints) {
    const storedHash = typeof stored === "string" ? stored : stored.hash;
    const sim = similarityScore(currentHash, storedHash);
    if (sim > bestMatch) {
      bestMatch = sim;
    }
  }

  const confidence = Math.min(bestMatch * 1.2, 1.0);
  return { bestMatch, confidence };
}

export type { FingerprintOptions, FingerprintResponse } from "./types";
