"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom, Glitch } from "@react-three/postprocessing";
import { GlitchMode } from "postprocessing";
import { Starfield } from "./Starfield";
import { TopicCluster } from "./TopicCluster";
import { useRouter } from "next/navigation";
import { useLessonStore } from "@/stores/useLessonStore";

export default function Scene() {
  const router = useRouter();
  const { isGlitching } = useLessonStore();

  return (
    <Canvas
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 15], fov: 30 }}
    >
      <color attach="background" args={["#050505"]} />
      
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        <Glitch 
            active={isGlitching}
            mode={GlitchMode.CONSTANT_MILD} 
            ratio={0.85}
        />
      </EffectComposer>

      {/* The Void */}
      <Suspense fallback={null}>
        <Starfield />
        
        {/* Navigation Clusters */}
        <TopicCluster 
          position={[-6, 0, 0]} 
          geometryType="cone" 
          color="#00f3ff" // Cyan
          label="PRIMITIVES"
          onClick={() => router.push('/lessons/primitives/xor')}
        />
        <TopicCluster 
          position={[0, 0, 0]} 
          geometryType="box" 
          color="#bc13fe" // Purple
          label="SYMMETRIC"
        />
        <TopicCluster 
          position={[6, 0, 0]} 
          geometryType="sphere" 
          color="#0aff0a" // Green
          label="ASYMMETRIC"
        />

        <Preload all />
      </Suspense>

      {/* Camera Controls - restricted for cinematic feel */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  );
}
