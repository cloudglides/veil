/* tslint:disable */
/* eslint-disable */

export function approx_entropy(samples: Float64Array, m: number): number;

export function cosine_similarity(v1: Float64Array, v2: Float64Array): number;

export function fnv_hash(s: string): string;

export function kolmogorov_complexity(s: string): number;

export function ks_test(values: Float64Array): number;

export function levenshtein_distance(s1: string, s2: string): number;

export function lz_complexity(data: Uint8Array): number;

export function murmur_hash(s: string): string;

export function sample_ent(samples: Float64Array, m: number, r: number): number;

export function shannon_entropy(s: string): number;

export function similarity_score(s1: string, s2: string): number;

export function spectral(samples: Float64Array): number;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly cosine_similarity: (a: number, b: number, c: number, d: number) => number;
  readonly levenshtein_distance: (a: number, b: number, c: number, d: number) => number;
  readonly similarity_score: (a: number, b: number, c: number, d: number) => number;
  readonly approx_entropy: (a: number, b: number, c: number) => number;
  readonly fnv_hash: (a: number, b: number) => [number, number];
  readonly kolmogorov_complexity: (a: number, b: number) => number;
  readonly ks_test: (a: number, b: number) => number;
  readonly lz_complexity: (a: number, b: number) => number;
  readonly sample_ent: (a: number, b: number, c: number, d: number) => number;
  readonly shannon_entropy: (a: number, b: number) => number;
  readonly spectral: (a: number, b: number) => number;
  readonly murmur_hash: (a: number, b: number) => [number, number];
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
