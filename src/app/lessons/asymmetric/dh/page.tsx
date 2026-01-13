"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { ColorExchange } from "@/features/asymmetric/ColorExchange";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useLessonStore } from "@/stores/useLessonStore";

export default function DHLessonPage() {
  const { logAction } = useLessonStore();
  
  useEffect(() => {
     logAction("Diffie-Hellman Key Exchange Initialized.");
     logAction("Public Color: RED. Private Colors: YELLOW (Alice), BLUE (Bob).");
  }, []);

  return (
    <LessonLayout
      title="The Color Exchange (Diffie-Hellman)"
      description="How can two people share a secret color in public without revealing their private colors? The answer is Modular Math (Mixing). We can mix colors easily, but we can't 'un-mix' them."
    >
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 40 }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        
        <ambientLight intensity={1} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#ffffff" />

        <Suspense fallback={null}>
          <ColorExchange />
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
