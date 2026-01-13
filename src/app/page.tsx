'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { Loader } from "@/components/layout/Loader";

// Dynamically import Scene to avoid SSR issues with R3F
const Scene = dynamic(() => import('@/components/canvas/Scene'), { 
  ssr: false,
  loading: () => <Loader />
});
import { useScramble } from "@/hooks/useScramble";

export default function Home() {
  const [wasmReady, setWasmReady] = useState(false);
  const { displayText } = useScramble("CRYPTOGRAPHY");

  // Keep Wasm loading logic for "God Prompt" completeness, 
  // but now we focus on the visual scene.
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasm = await import('@/lib/wasm/crypto-engine/crypto_engine');
        await wasm.default();
        // Simply log the greeting for now since we removed the state
        console.log("Wasm Greeting:", wasm.greet('Crypto-Verse'));
        setWasmReady(true);
      } catch (e) {
        console.error("Wasm failed", e);
      }
    };
    loadWasm();
  }, []);

  return (
    <main className="relative h-screen w-full bg-void overflow-hidden">
      {/* 3D Scene Background (z-0) */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* UI Overlay (z-10) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center">
        <h1 className="text-6xl font-bold tracking-[0.5em] text-neon-cyan animate-pulse font-mono">
          {displayText}
        </h1>
        
        {/* Status Indicators (Small, bottom right) */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 items-end">
          <div className="flex gap-2 text-xs font-mono">
             <span className="text-neon-purple/70">VISUAL ENGINE:</span>
             <span className="text-neon-cyan">ONLINE</span>
          </div>
          <div className="flex gap-2 text-xs font-mono">
             <span className="text-neon-purple/70">WASM CORE:</span>
             <span className={wasmReady ? "text-neon-green" : "text-yellow-500"}>
               {wasmReady ? "ACTIVE" : "CONNECTING..."}
             </span>
          </div>
        </div>
      </div>
    </main>
  );
}
