const MURMUR_SEED = 0x811c9dc5;
const FNV_PRIME = 16777619;
const FNV_OFFSET_BASIS = 2166136261;

export function murmurHash(str: string): string {
  let h1 = MURMUR_SEED;
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = (h1 + (h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24)) >>> 0;
  }
  return h1.toString(16);
}

export function fnvHash(str: string): string {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * FNV_PRIME) >>> 0;
  }
  return hash.toString(16);
}

export function shannonEntropy(data: string[]): number {
  const str = data.join("");
  const freq: Record<string, number> = {};

  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / str.length;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

export function entropyValue(data: string[]): number {
  const str = data.join("");
  let entropy = 0;
  for (let i = 0; i < str.length; i++) {
    entropy += Math.pow(str.charCodeAt(i), 2);
  }
  return entropy;
}

export function kolmogorovComplexity(str: string): number {
  let complexity = str.length;
  let lastChar = "";
  let runs = 0;

  for (const char of str) {
    if (char !== lastChar) runs++;
    lastChar = char;
  }

  return complexity + complexity * (runs / str.length);
}
