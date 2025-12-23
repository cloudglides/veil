pub use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn levenshtein_distance(s1: &str, s2: &str) -> u32 {
    let len1 = s1.len();
    let len2 = s2.len();
    let mut matrix = vec![vec![0u32; len2 + 1]; len1 + 1];

    for i in 0..=len1 {
        matrix[i][0] = i as u32;
    }
    for j in 0..=len2 {
        matrix[0][j] = j as u32;
    }

    let bytes1 = s1.as_bytes();
    let bytes2 = s2.as_bytes();

    for i in 1..=len1 {
        for j in 1..=len2 {
            let cost = if bytes1[i - 1] == bytes2[j - 1] { 0 } else { 1 };
            matrix[i][j] = std::cmp::min(
                std::cmp::min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1),
                matrix[i - 1][j - 1] + cost,
            );
        }
    }

    matrix[len1][len2]
}

#[wasm_bindgen]
pub fn similarity_score(s1: &str, s2: &str) -> f64 {
    let distance = levenshtein_distance(s1, s2) as f64;
    let max_len = std::cmp::max(s1.len(), s2.len()) as f64;
    if max_len == 0.0 {
        1.0
    } else {
        1.0 - (distance / max_len)
    }
}

#[wasm_bindgen]
pub fn cosine_similarity(v1: &[f64], v2: &[f64]) -> f64 {
    if v1.len() != v2.len() || v1.is_empty() {
        return 0.0;
    }

    let mut dot = 0.0;
    let mut mag1 = 0.0;
    let mut mag2 = 0.0;

    for i in 0..v1.len() {
        dot += v1[i] * v2[i];
        mag1 += v1[i] * v1[i];
        mag2 += v2[i] * v2[i];
    }

    mag1 = mag1.sqrt();
    mag2 = mag2.sqrt();

    if mag1 == 0.0 || mag2 == 0.0 {
        0.0
    } else {
        dot / (mag1 * mag2)
    }
}
