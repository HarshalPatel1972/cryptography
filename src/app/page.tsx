'use client';
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';

export default function Home() {
  const [wasmReady, setWasmReady] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Dynamic import to load Wasm asynchronously
    const loadWasm = async () => {
      try {
        const wasm = await import('@/lib/wasm/crypto-engine/crypto_engine');
        await wasm.default();
        const greetMsg = wasm.greet('Crypto-Verse');
        setGreeting(greetMsg);
        setWasmReady(true);
        console.log('[WASM] ', greetMsg);
      } catch (error) {
        console.error('[WASM] Failed to load:', error);
        setWasmReady(false);
      }
    };
    loadWasm();
  }, []);

  return (
    <main className="h-screen w-full bg-void text-neon-cyan flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold tracking-widest uppercase">
        System Initialized
      </h1>
      <div className="mt-4 flex gap-4">
        <span className="px-4 py-1 border border-neon-cyan/50 rounded">
          3D Engine: <span className="text-neon-green">ONLINE</span>
        </span>
        <span className="px-4 py-1 border border-neon-purple/50 rounded">
          Rust Core: {wasmReady ? <span className="text-neon-green">ACTIVE</span> : <span className="animate-pulse">LOADING...</span>}
        </span>
      </div>
      
      {greeting && (
        <p className="mt-4 text-sm text-neon-green/70 font-mono">{greeting}</p>
      )}
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Canvas>
          <mesh rotation={[0.5, 0.5, 0]}>
            <boxGeometry />
            <meshStandardMaterial color="#00f3ff" wireframe />
          </mesh>
          <ambientLight intensity={2} />
        </Canvas>
      </div>
    </main>
  );
}
