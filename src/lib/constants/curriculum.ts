export interface Module {
  id: string;
  title: string;
  locked?: boolean;
}

export interface Cluster {
  id: string;
  label: string;
  description: string;
  color: string;
  position: [number, number, number];
  geometry: "box" | "sphere" | "cone" | "octahedron" | "torus" | "icosahedron" | "dodecahedron" | "tetrahedron";
  modules: Module[];
  locked?: boolean;
}

export const CURRICULUM: Cluster[] = [
  {
    id: "primitives",
    label: "PRIMITIVES",
    description: "The atoms of encryption: Bits, XOR, and Math.",
    color: "#00f3ff", // Neon Cyan
    position: [-6, 0, 0],
    geometry: "cone",
    modules: [
      { id: "xor", title: "The XOR Gate" },
      { id: "binary", title: "Binary Logic", locked: true },
      { id: "modulo", title: "Modulo Arithmetic", locked: true },
    ],
  },
  {
    id: "classical",
    label: "CLASSICAL",
    description: "The history of secrets: From Caesar to Enigma.",
    color: "#d4af37", // Gold/Sepia
    position: [-4, 2, -4],
    geometry: "tetrahedron",
    modules: [
      { id: "caesar", title: "Caesar Cipher", locked: true },
      { id: "vigenere", title: "Vigenère Cipher", locked: true },
      { id: "enigma", title: "Enigma Machine", locked: true },
    ],
    locked: true,
  },
  {
    id: "symmetric",
    label: "SYMMETRIC",
    description: "The Shield: Shared keys and block ciphers.",
    color: "#0044ff", // Deep Blue 
    position: [0, 0, 0],
    geometry: "box",
    modules: [
      { id: "aes", title: "AES Encryption" },
      { id: "des", title: "DES (Legacy)", locked: true },
      { id: "chacha", title: "ChaCha20", locked: true },
    ],
  },
  {
    id: "asymmetric",
    label: "ASYMMETRIC",
    description: "The Exchange: Public keys and secrets.",
    color: "#bc13fe", // Neon Purple
    position: [6, 0, 0],
    geometry: "sphere",
    modules: [
      { id: "dh", title: "Diffie-Hellman" },
      { id: "rsa", title: "RSA", locked: true },
      { id: "ecc", title: "Elliptic Curves" },
    ],
  },
  {
    id: "hashing",
    label: "HASHING",
    description: "The Fingerprint: Integrity and proofs.",
    color: "#0aff0a", // Emerald Green
    position: [4, -2, -4],
    geometry: "octahedron",
    modules: [
      { id: "sha256", title: "SHA-256" },
      { id: "md5", title: "MD5 Collision", locked: true },
      { id: "hmac", title: "HMAC", locked: true },
    ],
  },
  {
    id: "identity",
    label: "IDENTITY",
    description: "Trust in a digital world: PKI and Signatures.",
    color: "#ffffff", // White
    position: [0, 4, -6],
    geometry: "icosahedron",
    modules: [
      { id: "dsa", title: "Digital Signatures" },
      { id: "x509", title: "Certificates", locked: true },
      { id: "tls", title: "TLS Handshake", locked: true },
    ],
  },
  {
    id: "zkp",
    label: "ZERO KNOWLEDGE",
    description: "Magic: Proving without revealing.",
    color: "#ff69b4", // Hot Pink
    position: [-8, -2, 4],
    geometry: "dodecahedron",
    modules: [
      { id: "zkp_intro", title: "Waldo Proof", locked: true },
      { id: "homomorphic", title: "Homomorphic", locked: true },
    ],
    locked: true,
  },
  {
    id: "blockchain",
    label: "BLOCKCHAIN",
    description: "The Ledger: Consensus and truth.",
    color: "#ff8800", // Orange
    position: [8, 2, 4],
    geometry: "torus",
    modules: [
      { id: "merkle", title: "Merkle Trees", locked: true },
      { id: "pow", title: "Proof of Work", locked: true },
    ],
    locked: true,
  },
];
