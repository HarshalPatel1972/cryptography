"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { AESCube } from "@/features/symmetric/AESCube";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useLessonStore } from "@/stores/useLessonStore";

export default function AESLessonPage() {
  const { logAction } = useLessonStore();
  
  // Log intro
  useEffect(() => {
     logAction("System Initialized: AES-128 Engine Ready.");
     logAction("Key: 000102030405060708090a0b0c0d0e0f");
  }, []);

  return (
    <LessonLayout
      title="The AES Cube (Symmetry)"
      description="Advanced Encryption Standard (AES) scrambles data in rounds. Observe the 4x4 state matrix. 'Confusion' (Color Change) and 'Diffusion' (Moving Positions) turn order into chaos."
    >
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 40 }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        
        <ambientLight intensity={1} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#00f3ff" />
        <pointLight position={[-5, -5, 5]} intensity={2} color="#ff0055" />

        <Suspense fallback={null}>
          <AESCube />
          <Preload all />
        </Suspense>

        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.0} />
        </EffectComposer>

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </LessonLayout>
  );
}
