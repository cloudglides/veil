import type { EntropySource } from "./scoring";

export interface SourceStability {
  source: string;
  stability: number;
  volatility: number;
  category: "stable" | "semi_volatile" | "volatile";
}

export interface EntropyWarning {
  source: string;
  severity: "info" | "warning" | "error";
  message: string;
  reason: string;
}

export interface DeviceSignature {
  os: string;
  hardware_cores: number;
  screen_resolution: string;
  user_agent_hash: string;
}

export interface PreferencesOffset {
  theme: string | null;
  language: string | null;
  timezone: string | null;
  font_size: string | null;
  dark_mode: boolean | null;
  accessibility: string | null;
}

export interface DeviceIdentity {
  core_hash: string;
  device_signature: DeviceSignature;
  entropy_quality: number;
  preferences_offset: PreferencesOffset;
  preferences_hash: string;
}

export interface FingerprintDrift {
  overall_similarity: number;
  drift_detected: boolean;
  changed_sources: Array<{
    name: string;
    previous: string;
    current: string;
    critical: boolean;
  }>;
  stability_breakdown: SourceStability[];
}

const STABILITY_THRESHOLDS = {
  stable: 0.85,
  semi_volatile: 0.5,
};

export function getSourceStability(sources: EntropySource[]): SourceStability[] {
  const stabilityMap: Record<string, number> = {
    userAgent: 0.95,
    os: 0.95,
    timezone: 0.98,
    hardware: 0.9,
    language: 0.92,
    screen: 0.88,
    osVersion: 0.85,
    browser: 0.93,
    canvas: 0.82,
    webgl: 0.8,
    fonts: 0.7,
    plugins: 0.75,
    storage: 0.5,
    adblock: 0.65,
    screenInfo: 0.85,
    webFeatures: 0.8,
    permissions: 0.6,
    preferences: 0.55,
    statistical: 0.7,
    probabilistic: 0.65,
    distribution: 0.75,
    complexity: 0.8,
    spectral: 0.75,
    approximate: 0.75,
    connection: 0.4,
    battery: 0.3,
    audio: 0.85,
    performance: 0.2,
  };

  return sources.map((source) => {
    const stability = stabilityMap[source.name] ?? 0.5;
    const volatility = 1 - stability;

    let category: "stable" | "semi_volatile" | "volatile";
    if (stability >= STABILITY_THRESHOLDS.stable) {
      category = "stable";
    } else if (stability >= STABILITY_THRESHOLDS.semi_volatile) {
      category = "semi_volatile";
    } else {
      category = "volatile";
    }

    return {
      source: source.name,
      stability,
      volatility,
      category,
    };
  });
}

export function detectFingerprintDrift(
  previousFingerprint: { hash: string; sources: Array<{ source: string; value: string; critical?: boolean }> },
  currentSources: EntropySource[],
): FingerprintDrift {
  const changed_sources: FingerprintDrift["changed_sources"] = [];
  let changeCount = 0;

  const criticalSources = new Set(["userAgent", "canvas", "webgl", "screen"]);

  for (const currentSource of currentSources) {
    const previousSource = previousFingerprint.sources.find(
      (s) => s.source === currentSource.name,
    );

    if (!previousSource) {
      changed_sources.push({
        name: currentSource.name,
        previous: "N/A",
        current: currentSource.value,
        critical: criticalSources.has(currentSource.name),
      });
      changeCount++;
    } else if (previousSource.value !== currentSource.value) {
      changed_sources.push({
        name: currentSource.name,
        previous: previousSource.value,
        current: currentSource.value,
        critical: criticalSources.has(currentSource.name),
      });
      changeCount++;
    }
  }

  const stability_breakdown = getSourceStability(currentSources);

  const criticalChanges = changed_sources.filter((c) => c.critical).length;
  const volatileSources = stability_breakdown.filter(
    (s) => s.category === "volatile",
  ).length;

  const expectedChanges = volatileSources * 0.5;
  const drift_detected = criticalChanges > 0 || changeCount > expectedChanges + 3;

  const overall_similarity = Math.max(
    0,
    1 - (changeCount / currentSources.length) * 0.5,
  );

  return {
    overall_similarity,
    drift_detected,
    changed_sources,
    stability_breakdown,
  };
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function detectEntropyAnomalies(sources: EntropySource[]): EntropyWarning[] {
  const warnings: EntropyWarning[] = [];
  const sourceMap = new Map(sources.map((s) => [s.name, s]));

  for (const source of sources) {
    const value = source.value.toLowerCase();

    if (!value || value.length === 0) {
      warnings.push({
        source: source.name,
        severity: "error",
        message: "Empty entropy value",
        reason: "Source returned no data, likely blocked or unavailable API",
      });
    }

    if (/^(null|undefined|nan|n\/a|-1|0x0|unknown|not available|blocked)$/i.test(value)) {
      warnings.push({
        source: source.name,
        severity: "error",
        message: "Suspicious placeholder value detected",
        reason: "Value appears to be a default/placeholder, not real entropy",
      });
    }

    if (source.entropy === 0 && value.length > 2) {
      warnings.push({
        source: source.name,
        severity: "warning",
        message: "Zero entropy despite non-empty value",
        reason: "Value is highly repetitive or contains minimal information",
      });
    }

    if (source.entropy > 8 && value.length < 5) {
      warnings.push({
        source: source.name,
        severity: "warning",
        message: "Suspiciously high entropy in very short value",
        reason: "Short strings cannot contain this much entropy mathematically",
      });
    }

    if (source.name === "canvas" || source.name === "webgl") {
      if (value.length < 10) {
        warnings.push({
          source: source.name,
          severity: "warning",
          message: "Graphics fingerprint is unusually short",
          reason: "Canvas/WebGL fingerprints should contain detailed rendering info",
        });
      }
    }

    if (source.name === "fonts") {
      if (value === "0" || value === "[]" || value.split(",").length < 3) {
        warnings.push({
          source: source.name,
          severity: "warning",
          message: "Suspiciously few fonts detected",
          reason: "System should report 50+ fonts; low count suggests API blocking",
        });
      }
    }

    if (source.name === "screen") {
      const match = value.match(/(\d+)x(\d+)/);
      if (match) {
        const [w, h] = [parseInt(match[1]), parseInt(match[2])];
        if (w < 320 || h < 240 || w > 7680 || h > 4320) {
          warnings.push({
            source: source.name,
            severity: "warning",
            message: "Unusual screen resolution detected",
            reason: `Resolution ${w}x${h} is outside normal range`,
          });
        }
      }
    }

    if (source.name === "userAgent") {
      const isCommonUA = /chrome|firefox|safari|edge|mozilla/i.test(value);
      if (!isCommonUA && value.length > 10) {
        warnings.push({
          source: source.name,
          severity: "info",
          message: "Unusual user agent detected",
          reason: "User agent does not match known browsers",
        });
      }
    }
  }

  if (sources.length > 0) {
    const avgEntropy = sources.reduce((a, b) => a + b.entropy, 0) / sources.length;
    if (avgEntropy < 0.3) {
      warnings.push({
        source: "_system",
        severity: "warning",
        message: "Overall entropy is very low",
        reason: "Average entropy across sources is below 0.3, fingerprint may be unreliable",
      });
    }
  }

  return warnings;
}

export function extractDeviceSignature(sources: EntropySource[]): DeviceSignature {
  const osSource = sources.find((s) => s.name === "os");
  const hardwareSource = sources.find((s) => s.name === "hardware");
  const screenSource = sources.find((s) => s.name === "screen");
  const uaSource = sources.find((s) => s.name === "userAgent");

  const os = osSource?.value.split("|")[0] ?? "unknown";
  const hardwareStr = hardwareSource?.value ?? "0";
  const cores = parseInt(hardwareStr.match(/\d+/)?.[0] ?? "0");
  const resolution = screenSource?.value ?? "0x0";
  const uaHash = uaSource ? hashString(uaSource.value) : "0";

  return {
    os,
    hardware_cores: cores,
    screen_resolution: resolution,
    user_agent_hash: uaHash,
  };
}

function extractPreferencesOffset(sources: EntropySource[]): PreferencesOffset {
  const langSource = sources.find((s) => s.name === "language");
  const tzSource = sources.find((s) => s.name === "timezone");
  const prefSource = sources.find((s) => s.name === "preferences");

  let theme: string | null = null;
  let dark_mode: boolean | null = null;
  let accessibility: string | null = null;

  if (prefSource && prefSource.value) {
    const parts = prefSource.value.split("|");
    if (parts.length > 0) dark_mode = parts[0] === "true";
    if (parts.length > 1) theme = parts[1];
    if (parts.length > 2) accessibility = parts[2];
  }

  return {
    language: langSource ? langSource.value.split("|")[0] : null,
    timezone: tzSource ? tzSource.value.split("|")[0] : null,
    theme,
    dark_mode,
    font_size: null,
    accessibility,
  };
}

export function generateDeviceIdentity(sources: EntropySource[]): DeviceIdentity {
  const signature = extractDeviceSignature(sources);
  const signatureStr = `${signature.os}|${signature.hardware_cores}|${signature.screen_resolution}|${signature.user_agent_hash}`;
  const coreHash = hashString(signatureStr);

  const preferences = extractPreferencesOffset(sources);
  const prefsStr = `${preferences.language}|${preferences.timezone}|${preferences.theme}|${preferences.dark_mode}|${preferences.accessibility}`;
  const prefsHash = hashString(prefsStr);

  const qualityScore =
    sources.filter((s) => s.entropy > 0.5).length / Math.max(sources.length, 1);

  return {
    core_hash: coreHash,
    device_signature: signature,
    entropy_quality: qualityScore,
    preferences_offset: preferences,
    preferences_hash: prefsHash,
  };
}

export function assessFingerprint(
  sources: EntropySource[],
): {
  usable: boolean;
  confidence: number;
  warnings: string[];
  entropy_warnings: EntropyWarning[];
} {
  const stability = getSourceStability(sources);
  const entropyWarnings = detectEntropyAnomalies(sources);
  const warnings: string[] = [];
  let usable = true;
  let confidence = 1;

  const stableCount = stability.filter((s) => s.category === "stable").length;
  const volatileCount = stability.filter((s) => s.category === "volatile").length;

  if (stableCount < 5) {
    warnings.push(
      `Only ${stableCount} stable sources available, fingerprint may be unreliable`,
    );
    confidence -= 0.2;
  }

  if (volatileCount > sources.length * 0.5) {
    warnings.push("Fingerprint heavily dependent on volatile sources");
    confidence -= 0.15;
  }

  const zeroEntropyCount = sources.filter((s) => s.entropy === 0).length;
  if (zeroEntropyCount > sources.length * 0.3) {
    warnings.push(`${zeroEntropyCount} sources have zero entropy`);
    confidence -= 0.25;
    if (zeroEntropyCount > sources.length * 0.6) {
      usable = false;
    }
  }

  const errorWarnings = entropyWarnings.filter((w) => w.severity === "error").length;
  if (errorWarnings > sources.length * 0.2) {
    confidence -= 0.2;
    if (errorWarnings > sources.length * 0.4) {
      usable = false;
    }
  }

  return {
    usable,
    confidence: Math.max(0, confidence),
    warnings,
    entropy_warnings: entropyWarnings,
  };
}
