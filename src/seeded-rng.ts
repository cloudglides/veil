export function seededRng(seed: string, count: number): number[] {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
  }

  const samples: number[] = [];
  for (let i = 0; i < count; i++) {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    samples.push(hash / 0x7fffffff);
  }

  return samples;
}
