use wasm_bindgen::prelude::*;

const MURMUR_SEED: u32 = 0x811c9dc5;
const FNV_PRIME: u32 = 16777619;
const FNV_OFFSET_BASIS: u32 = 2166136261;

#[wasm_bindgen]
pub fn murmur_hash(s: &str) -> String{
    let mut h1 = MURMUR_SEED;
    for byte in s.as_bytes(){
        h1^=*byte as u32;
        h1=h1.wrapping_add(h1<<1).wrapping_add(h1<<4).wrapping_add(h1<<7).wrapping_add(h1<<8).wrapping_add(h1<<24);
    }
    format!("{:x}",h1)
}

#[wasm_bindgen]
pub fn fnv_hash(s:&str)-> String{
    let mut hash = FNV_OFFSET_BASIS;
    for byte in s.as_bytes(){
        hash ^=*byte as u32;
        hash = hash.wrapping_mul(FNV_PRIME)
    }
    format!("{:x}",hash)
}
