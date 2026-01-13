# Crypto-Verse: Interactive Cryptography Explorer 🛡️

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![Rust](https://img.shields.io/badge/Rust-1.75+-orange)
![Wasm](https://img.shields.io/badge/Wasm-active-purple)
![Three.js](https://img.shields.io/badge/Three.js-r3f-white)

> **"Master the art of encryption. A 3D interactive journey from XOR to Elliptic Curves."**

Crypto-Verse is an educational platform that visualizes complex cryptographic concepts using **WebGL (Three.js)** and **Real Wasm Logic**. It simulates a "Hacker Terminal" experience where users learn by doing.

---

## 🚀 The Stack (Hybrid Architecture)

This project uses a high-performance **Hybrid Architecture**:
- **Frontend**: Next.js 15 + React Three Fiber (Canvas).
- **Core Logic**: Rust (compiled to WebAssembly via `wasm-pack`).
- **Styling**: TailwindCSS (Cyberpunk Theme).
- **Game Engine**: Zustand + use-sound + Rapier Physics.

| Layer | Tech | Purpose |
|-------|------|---------|
| **UI** | Next.js / Tailwind | Layout, Terminal, Navigation |
| **Visuals** | Three.js / R3F | 3D Scenes, Particles, Shaders |
| **Physics** | Rapier | Collision Detection (XOR Rain, Hash Mirror) |
| **Compute** | **Rust Wasm** | AES Rounds, SHA-256 Hashing, BigInt Math |

---

## 📚 The Curriculum

1.  **Primitives**: The Bit & The XOR Gate (Neon Rain).
2.  **Symmetric**: AES-128 Encryption (The Cube).
3.  **Asymmetric**: Diffie-Hellman Key Exchange (Color Mixing).
4.  **Hashing**: SHA-256 Avalanche Effect (Shattering Mirror).
5.  **Signatures**: Digital Signatures (Holographic Seal).
6.  **ECC**: Elliptic Curve Cryptography (Cosmic Billiards).

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ (or Bun)
- Rust & Cargo (`rustup`)
- `wasm-pack` (`cargo install wasm-pack`)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/crypto-verse.git
cd crypto-verse
npm install
```

### 2. Build the Rust Core
*Note: The Wasm binary is pre-committed in `src/lib/wasm` for convenience, but you can rebuild it:*
```bash
cd crates/crypto-engine
wasm-pack build --target web --out-dir ../../src/lib/wasm/crypto-engine
cd ../..
```

### 3. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`.

---

## 🎮 Gamification (CTF Mode)
The app features a hidden **Capture The Flag** layer.
- Open the terminal at the bottom of a lesson.
- Type `help` to see commands.
- Solve challenges (like brute-forcing an XOR cipher) to unlock achievements.

---

## 📦 Deployment
The project is optimized for **Vercel**.
- `vercel.json` handles `.wasm` MIME types.
- `next.config.ts` handles Wasm async loading.

```json
/* vercel.json */
{
  "headers": [
    { "source": "/(.*).wasm", "headers": [{ "key": "Content-Type", "value": "application/wasm" }] }
  ]
}
```

---

## 🤝 Contributing
1.  Fork the repo.
2.  Create a branch: `git checkout -b feat/new-lesson`.
3.  Commit changes (follow Conventional Commits): `git commit -m "feat: add RSA visualization"`.
4.  Push & PR.

---

Built with 💻 and 🦀 by **The Architect**.
