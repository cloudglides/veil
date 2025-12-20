export function murmurHash(str: string): string {
  let h1 = 0x811c9dc5;

  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = (h1 + (h1 << 1) + (h1 << 4) + (h1 << 7) + (h1 << 8) + (h1 << 24)) >>> 0;
  }

  return h1.toString(16);
}

export function entropyValue(data: string[]): number {
  const str = data.join("");
  let entropy = 0;

  for (let i = 0; i < str.length; i++) {
    entropy += Math.pow(str.charCodeAt(i), 2);
  }

  return entropy;
}
