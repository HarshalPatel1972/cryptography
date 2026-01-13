use wasm_bindgen::prelude::*;

/// A simple greeting function to verify Wasm works
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Rust crypto-engine is active.", name)
}

/// XOR encryption - a simple cipher for demonstration
#[wasm_bindgen]
pub fn xor_encrypt(data: &[u8], key: u8) -> Vec<u8> {
    data.iter().map(|byte| byte ^ key).collect()
}

/// XOR decryption (same as encryption for XOR)
#[wasm_bindgen]
pub fn xor_decrypt(data: &[u8], key: u8) -> Vec<u8> {
    xor_encrypt(data, key)
}
