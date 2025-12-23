export interface FingerprintOptions {
  entropy: {
    userAgent?: boolean;
    canvas?: boolean;
    webgl?: boolean;
    fonts?: boolean;
    storage?: boolean;
    screen?: boolean;
  };
  hash?: "sha256" | "sha512";
  detailed?: boolean;
}

export interface SourceMetric {
  source: string;
  value: string;
  entropy: number;
  confidence: number;
}

import type { Anomaly } from "./tamper";

export interface FingerprintResponse {
  hash: string;
  uniqueness: number;
  confidence: number;
  tampering_risk: number;
  anomalies: Anomaly[];
  sources: SourceMetric[];
  system: {
    os: string;
    language: string;
    timezone: string;
    hardware: {
      cores: number;
      memory: number;
    };
  };
  display: {
    resolution: string;
    colorDepth: number;
    devicePixelRatio: number;
  };
  browser: {
    userAgent: string;
    vendor: string;
    cookieEnabled: boolean;
  };
}
