import type { EntropySource } from "./scoring";

export type AnomalySeverity = "low" | "medium" | "high" | "critical";
export type AnomalyCategory =
  | "entropy_distribution"
  | "missing_sources"
  | "value_spoofing"
  | "cross_source_inconsistency"
  | "data_quality";

export interface Anomaly {
  id: string;
  category: AnomalyCategory;
  severity: AnomalySeverity;
  message: string;
  explanation: string;
  riskContribution: number;
}

export interface TamperAnalysis {
  tampering_risk: number;
  anomalies: Anomaly[];
}

export function analyzeTamper(sources: EntropySource[]): TamperAnalysis {
  const anomalies: Anomaly[] = [];
  let riskScore = 0;

  if (sources.length === 0) {
    anomalies.push({
      id: "no_sources",
      category: "missing_sources",
      severity: "critical",
      message: "No entropy sources collected",
      explanation:
        "The fingerprinting process failed to collect any entropy data. This may indicate a sandbox environment or blocked APIs.",
      riskContribution: 0.9,
    });
    return { tampering_risk: 0.9, anomalies };
  }

  const entropies = sources.map((s) => s.entropy);
  const values = sources.map((s) => s.value);

  const mean = entropies.reduce((a, b) => a + b, 0) / entropies.length;
  const variance =
    entropies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / entropies.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 0.05) {
    const contribution = 0.25;
    anomalies.push({
      id: "uniform_entropy",
      category: "entropy_distribution",
      severity: "high",
      message: "All entropy sources have suspiciously similar values",
      explanation: `Standard deviation of entropy across sources is ${stdDev.toFixed(4)}, indicating very low variance. Real fingerprints should show diverse entropy patterns.`,
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const uniqueValues = new Set(values);
  if (uniqueValues.size < sources.length * 0.5) {
    const contribution = 0.2;
    const duplicateCount = sources.length - uniqueValues.size;
    anomalies.push({
      id: "duplicate_values",
      category: "data_quality",
      severity: "medium",
      message: `${duplicateCount} duplicate values detected across entropy sources`,
      explanation:
        "High duplication suggests cached or placeholder values. Expected diversity is not present.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const emptyOrShort = values.filter((v) => !v || v.length < 2).length;
  if (emptyOrShort > sources.length * 0.3) {
    const contribution = 0.15;
    anomalies.push({
      id: "empty_sources",
      category: "data_quality",
      severity: "high",
      message: `${emptyOrShort} sources are empty or too short`,
      explanation:
        "Several entropy sources produced minimal data. This may indicate blocked APIs or restricted environment.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const sourceNames = sources.map((s) => s.name);
  const criticalSources = ["userAgent", "canvas", "webgl", "fonts"];
  const missingCritical = criticalSources.filter(
    (c) => !sourceNames.includes(c),
  );

  if (missingCritical.length > 0) {
    const contribution =
      0.2 * (missingCritical.length / criticalSources.length);
    anomalies.push({
      id: "missing_critical",
      category: "missing_sources",
      severity:
        missingCritical.length === criticalSources.length ? "critical" : "high",
      message: `Missing critical sources: ${missingCritical.join(", ")}`,
      explanation:
        "These sources are fundamental to browser fingerprinting. Their absence reduces fingerprint reliability and suggests API restrictions or tampering.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const canvasSource = sources.find((s) => s.name === "canvas");
  const webglSource = sources.find((s) => s.name === "webgl");

  if (
    canvasSource &&
    webglSource &&
    canvasSource.value === webglSource.value &&
    canvasSource.entropy < 0.5
  ) {
    const contribution = 0.15;
    anomalies.push({
      id: "canvas_webgl_match",
      category: "cross_source_inconsistency",
      severity: "high",
      message: "Canvas and WebGL fingerprints are identical",
      explanation:
        "Canvas and WebGL rendering engines should produce different fingerprints. Identical values indicate either spoofing or a very unusual environment.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const screenSource = sources.find((s) => s.name === "screen");
  if (screenSource && screenSource.value.length < 3) {
    const contribution = 0.1;
    anomalies.push({
      id: "screen_entropy_low",
      category: "data_quality",
      severity: "low",
      message: "Screen entropy data is suspiciously minimal",
      explanation:
        "Screen information should provide resolution and color depth data. Very short values suggest incomplete data collection.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const maxEntropy = Math.max(...entropies);
  const minEntropy = Math.min(...entropies);
  if (maxEntropy > 0 && minEntropy / maxEntropy < 0.1) {
    const contribution = 0.15;
    anomalies.push({
      id: "entropy_variance",
      category: "entropy_distribution",
      severity: "medium",
      message: `Extreme variance in entropy: min/max ratio is ${(minEntropy / maxEntropy).toFixed(3)}`,
      explanation:
        "Some sources have drastically different entropy levels, suggesting uneven data collection or selective API blocking.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const zeroEntropyCount = entropies.filter((e) => e === 0).length;
  if (zeroEntropyCount > sources.length * 0.4) {
    const contribution = 0.1;
    anomalies.push({
      id: "zero_entropy",
      category: "data_quality",
      severity: "medium",
      message: `${zeroEntropyCount} sources have zero entropy`,
      explanation:
        "Zero entropy typically means identical or highly repetitive data. Many sources with zero entropy suggests a restricted or heavily spoofed environment.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const suspiciousPatterns = sources.filter((s) =>
    /^(null|undefined|test|fake|mock)$/i.test(s.value),
  );
  if (suspiciousPatterns.length > 0) {
    const contribution = 0.2;
    anomalies.push({
      id: "placeholder_values",
      category: "value_spoofing",
      severity: "critical",
      message: `Placeholder values detected: ${suspiciousPatterns.map((s) => s.name).join(", ")}`,
      explanation:
        "Sources contain obvious placeholder/test values (null, undefined, fake, mock). This is a strong indicator of intentional spoofing.",
      riskContribution: contribution,
    });
    riskScore += contribution;
  }

  const finalRisk = Math.min(riskScore, 1);

  return {
    tampering_risk: finalRisk,
    anomalies,
  };
}
