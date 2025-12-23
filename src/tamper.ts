import type { EntropySource } from "./scoring";

export interface TamperAnalysis {
  tampering_risk: number;
  flags: string[];
  anomalies: string[];
}

export function analyzeTamper(sources: EntropySource[]): TamperAnalysis {
  const flags: string[] = [];
  const anomalies: string[] = [];
  let riskScore = 0;

  if (sources.length === 0) {
    flags.push("no_sources");
    return { tampering_risk: 0.9, flags, anomalies };
  }

  const entropies = sources.map((s) => s.entropy);
  const values = sources.map((s) => s.value);

  const mean = entropies.reduce((a, b) => a + b, 0) / entropies.length;
  const variance =
    entropies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / entropies.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 0.05) {
    anomalies.push("suspiciously_uniform_entropy");
    riskScore += 0.25;
  }

  const uniqueValues = new Set(values);
  if (uniqueValues.size < sources.length * 0.5) {
    anomalies.push("duplicate_values_detected");
    riskScore += 0.2;
  }

  const emptyOrShort = values.filter((v) => !v || v.length < 2).length;
  if (emptyOrShort > sources.length * 0.3) {
    anomalies.push("too_many_empty_sources");
    riskScore += 0.15;
  }

  const sourceNames = sources.map((s) => s.name);
  const criticalSources = ["userAgent", "canvas", "webgl", "fonts"];
  const missingCritical = criticalSources.filter(
    (c) => !sourceNames.includes(c),
  );
  if (missingCritical.length > 0) {
    anomalies.push(`missing_critical_sources: ${missingCritical.join(", ")}`);
    riskScore += 0.2 * (missingCritical.length / criticalSources.length);
  }

  const canvasSource = sources.find((s) => s.name === "canvas");
  const webglSource = sources.find((s) => s.name === "webgl");
  const screenSource = sources.find((s) => s.name === "screen");

  if (
    canvasSource &&
    webglSource &&
    canvasSource.value === webglSource.value &&
    canvasSource.entropy < 0.5
  ) {
    anomalies.push("canvas_webgl_suspiciously_identical");
    riskScore += 0.15;
  }

  if (screenSource && screenSource.value.length < 3) {
    anomalies.push("screen_entropy_suspiciously_low");
    riskScore += 0.1;
  }

  const maxEntropy = Math.max(...entropies);
  const minEntropy = Math.min(...entropies);
  if (maxEntropy > 0 && minEntropy / maxEntropy < 0.1) {
    anomalies.push("extreme_entropy_variance");
    riskScore += 0.15;
  }

  const zeroEntropyCount = entropies.filter((e) => e === 0).length;
  if (zeroEntropyCount > sources.length * 0.4) {
    anomalies.push("too_many_zero_entropy_sources");
    riskScore += 0.1;
  }

  const suspiciousPatterns = sources.filter((s) =>
    /^(null|undefined|test|fake|mock)$/i.test(s.value),
  );
  if (suspiciousPatterns.length > 0) {
    anomalies.push(
      `suspicious_placeholder_values: ${suspiciousPatterns.map((s) => s.name).join(", ")}`,
    );
    riskScore += 0.2;
  }

  const finalRisk = Math.min(riskScore, 1);

  return {
    tampering_risk: finalRisk,
    flags,
    anomalies,
  };
}
