use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};
use aes::cipher::{BlockEncrypt, KeyInit};
use aes::Aes128; 

const SBOX: [u8; 256] = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

const RCON: [u8; 10] = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Rust crypto-engine is active.", name)
}

#[wasm_bindgen]
pub fn xor_encrypt(data: &str, key: &str) -> String {
    let key_bytes = key.as_bytes();
    let result: String = data.chars().enumerate().map(|(i, c)| {
        let key_char = key_bytes[i % key_bytes.len()] as char;
        let xored = (c as u8 ^ key_char as u8) as char;
        xored
    }).collect();
    result
}

fn sub_word(word: u32) -> u32 {
    let b0 = SBOX[((word >> 24) & 0xff) as usize];
    let b1 = SBOX[((word >> 16) & 0xff) as usize];
    let b2 = SBOX[((word >> 8) & 0xff) as usize];
    let b3 = SBOX[(word & 0xff) as usize];
    ((b0 as u32) << 24) | ((b1 as u32) << 16) | ((b2 as u32) << 8) | (b3 as u32)
}

fn rot_word(word: u32) -> u32 {
    (word << 8) | (word >> 24)
}

fn key_expansion(key: &[u8; 16]) -> Vec<u32> {
    let mut w = Vec::with_capacity(44);
    for i in 0..4 {
        w.push(((key[4 * i] as u32) << 24) |
               ((key[4 * i + 1] as u32) << 16) |
               ((key[4 * i + 2] as u32) << 8) |
               (key[4 * i + 3] as u32));
    }

    for i in 4..44 {
        let mut temp = w[i - 1];
        if i % 4 == 0 {
            temp = sub_word(rot_word(temp)) ^ ((RCON[(i / 4) - 1] as u32) << 24);
        }
        w.push(w[i - 4] ^ temp);
    }
    w
}

fn sub_bytes(state: &mut [u8; 16]) {
    for i in 0..16 {
        state[i] = SBOX[state[i] as usize];
    }
}

fn shift_rows(state: &mut [u8; 16]) {
    let temp = state[1]; state[1] = state[5]; state[5] = state[9]; state[9] = state[13]; state[13] = temp;
    let temp1 = state[2]; let temp2 = state[6]; state[2] = state[10]; state[6] = state[14]; state[10] = temp1; state[14] = temp2;
    let temp = state[15]; state[15] = state[11]; state[11] = state[7]; state[7] = state[3]; state[3] = temp;
}

fn gmul(a: u8, b: u8) -> u8 {
    let mut p = 0;
    let mut a_high = a;
    let mut b_high = b;
    for _ in 0..8 {
        if (b_high & 1) != 0 { p ^= a_high; }
        let hi_bit_set = (a_high & 0x80) != 0;
        a_high <<= 1;
        if hi_bit_set { a_high ^= 0x1b; }
        b_high >>= 1;
    }
    p
}

fn mix_columns(state: &mut [u8; 16]) {
    let mut tmp = [0u8; 16];
    for c in 0..4 {
        let idx = c * 4;
        let s0 = state[idx]; let s1 = state[idx + 1]; let s2 = state[idx + 2]; let s3 = state[idx + 3];
        tmp[idx] = gmul(0x02, s0) ^ gmul(0x03, s1) ^ s2 ^ s3;
        tmp[idx + 1] = s0 ^ gmul(0x02, s1) ^ gmul(0x03, s2) ^ s3;
        tmp[idx + 2] = s0 ^ s1 ^ gmul(0x02, s2) ^ gmul(0x03, s3);
        tmp[idx + 3] = gmul(0x03, s0) ^ s1 ^ s2 ^ gmul(0x02, s3);
    }
    *state = tmp;
}

fn add_round_key(state: &mut [u8; 16], w: &[u32], round: usize) {
    for c in 0..4 {
        let word = w[round * 4 + c];
        let idx = c * 4;
        state[idx] ^= (word >> 24) as u8;
        state[idx + 1] ^= (word >> 16) as u8;
        state[idx + 2] ^= (word >> 8) as u8;
        state[idx + 3] ^= (word & 0xff) as u8;
    }
}

#[wasm_bindgen]
pub fn get_aes_rounds(key_hex: &str, plaintext_hex: &str) -> JsValue {
    let mut key = [0u8; 16];
    let key_vec = hex::decode(key_hex).unwrap_or(vec![0; 16]); 
    for (i, b) in key_vec.iter().take(16).enumerate() { key[i] = *b; }

    let mut state = [0u8; 16];
    let pt_vec = hex::decode(plaintext_hex).unwrap_or(vec![0; 16]);
    for (i, b) in pt_vec.iter().take(16).enumerate() { state[i] = *b; }

    let mut rounds_data = Vec::new();
    let w = key_expansion(&key);

    rounds_data.push(state.clone());
    add_round_key(&mut state, &w, 0);
    rounds_data.push(state.clone());

    for round in 1..10 {
        sub_bytes(&mut state);
        shift_rows(&mut state);
        mix_columns(&mut state);
        add_round_key(&mut state, &w, round);
        rounds_data.push(state.clone());
    }

    sub_bytes(&mut state);
    shift_rows(&mut state);
    add_round_key(&mut state, &w, 10);
    rounds_data.push(state.clone());

    serde_wasm_bindgen::to_value(&rounds_data).unwrap()
}

#[wasm_bindgen]
pub fn get_sha256(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}
