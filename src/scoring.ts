import { calculateMean, hellingerDistance } from "./probability";

export interface EntropySource {
  name: string;
  value: string;
  entropy: number;
}

export interface FingerprintScore {
  likelihood: number;
  confidence: number;
  uniqueness: number;
  divergence: number;
  sources: EntropySource[];
}

export function calculateEntropy(data: string): number {
  const freq: Record<string, number> = {};
  for (const char of data) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / data.length;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

export function calculateLikelihood(sources: EntropySource[]): number {
  const entropies = sources.map(s => s.entropy).filter(e => !isNaN(e) && e > 0);
  
  if (entropies.length === 0) return 0;

  const mean = entropies.reduce((a, b) => a + b) / entropies.length;
  const variance = entropies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / entropies.length;
  const stdDev = Math.sqrt(variance);

  return mean * (1 + stdDev / mean);
}

export function calculateConfidence(sources: EntropySource[], likelihood: number): number {
  const maxPossibleEntropy = Math.log2(256);
  const sourceCount = sources.length;
  
  const normalizedLikelihood = Math.min(likelihood / maxPossibleEntropy, 1);
  const sourceWeighting = Math.log2(sourceCount + 1) / Math.log2(32);
  
  return normalizedLikelihood * sourceWeighting;
}

export function calculateUniqueness(sources: EntropySource[], likelihood: number, confidence: number): number {
  const distinctSources = new Set(sources.map(s => s.value)).size;
  const totalSources = sources.length;
  const diversity = distinctSources / totalSources;
  
  const informationContent = likelihood * Math.log2(totalSources);
  const uniquenessScore = informationContent * confidence * diversity;
  
  return Math.min(uniquenessScore / 100, 0.999);
}

export function scoreFingerprint(sources: EntropySource[]): FingerprintScore {
  const likelihood = calculateLikelihood(sources);
  const confidence = calculateConfidence(sources, likelihood);
  const uniqueness = calculateUniqueness(sources, likelihood, confidence);
  
  const entropies = sources.map(s => s.entropy).filter(e => !isNaN(e) && e > 0);
  const uniformDist = new Array(entropies.length).fill(1 / entropies.length);
  const normalizedEntropies = entropies.length > 0 
    ? entropies.map(e => e / calculateMean(entropies))
    : [];
  
  const divergence = normalizedEntropies.length > 0 
    ? hellingerDistance(normalizedEntropies, uniformDist.slice(0, normalizedEntropies.length))
    : 0;

  return {
    likelihood,
    confidence,
    uniqueness,
    divergence,
    sources,
  };
}

export function bayesianCombine(sources: EntropySource[]): Record<string, number> {
  const score = scoreFingerprint(sources);
  
  const weights: Record<string, number> = {};
  const totalEntropy = sources.reduce((sum, s) => sum + (s.entropy || 0), 0);

  for (const source of sources) {
    const sourceEntropy = source.entropy || 0;
    const prior = 1 / sources.length;
    const likelihood = sourceEntropy / (totalEntropy || 1);
    const posterior = (likelihood * prior) / score.likelihood;
    
    weights[source.name] = posterior;
  }

  return weights;
}
