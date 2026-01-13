'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { Loader } from "@/components/layout/Loader";

// Dynamically import Scene to avoid SSR issues with R3F
const Scene = dynamic(() => import('@/components/canvas/Scene'), { 
  ssr: false,
  loading: () => <Loader />
});
import { CurriculumGrid } from "@/components/dom/CurriculumGrid";

export default function Home() {
  const [wasmReady, setWasmReady] = useState(false);
  // const { displayText } = useScramble("CRYPTOGRAPHY"); // Removed in Phase 6.9

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

      {/* Main Command Center Overlay (z-10) */}
      <div className="absolute inset-0 z-10">
        <CurriculumGrid />
      </div>
    </main>
  );
}
