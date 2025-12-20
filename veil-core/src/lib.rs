use std::usize;

use wasm_bindgen::prelude::*;

const MURMUR_SEED: u32 = 0x811c9dc5;
const FNV_PRIME: u32 = 16777619;
const FNV_OFFSET_BASIS: u32 = 2166136261;

#[wasm_bindgen]
pub fn murmur_hash(s: &str) -> String {
    let mut h1 = MURMUR_SEED;
    for byte in s.as_bytes() {
        h1 ^= *byte as u32;
        h1 = h1
            .wrapping_add(h1 << 1)
            .wrapping_add(h1 << 4)
            .wrapping_add(h1 << 7)
            .wrapping_add(h1 << 8)
            .wrapping_add(h1 << 24);
    }
    format!("{:x}", h1)
}

#[wasm_bindgen]
pub fn fnv_hash(s: &str) -> String {
    let mut hash = FNV_OFFSET_BASIS;
    for byte in s.as_bytes() {
        hash ^= *byte as u32;
        hash = hash.wrapping_mul(FNV_PRIME);
    }
    format!("{:x}", hash)
}

#[wasm_bindgen]
pub fn shannon_entropy(s: &str) -> f64 {
    let mut freq = [0usize; 256];
    for byte in s.as_bytes() {
        freq[*byte as usize] += 1;
    }
    let len = s.len() as f64;
    let mut entropy = 0.0;

    for &count in &freq {
        if count > 0 {
            let p = count as f64 / len;
            entropy -= p * p.log2();
        }
    }
    entropy
}
#[wasm_bindgen]
pub fn kolmogorov_complexity(s: &str) -> f64 {
    let len = s.len();
    let mut runs = 0;
    let bytes = s.as_bytes();

    for i in 1..bytes.len() {
        if bytes[i] != bytes[i - 1] {
            runs += 1;
        }
    }
    (len as f64) + (len as f64 * (runs as f64 / len as f64))
}
