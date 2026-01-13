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
import { CURRICULUM } from "@/lib/constants/curriculum";

export default function Scene() {
  const router = useRouter();
  const { isGlitching } = useLessonStore();

  const handleTopicClick = (id: string, locked?: boolean) => {
      if (locked) return;
      
      // Map IDs to routes
      const routes: Record<string, string> = {
          "primitives": "/lessons/primitives/xor",
          "symmetric": "/lessons/symmetric/aes",
          "asymmetric": "/lessons/asymmetric/dh",
          "hashing": "/lessons/hashing/sha256",
          "identity": "/lessons/signatures/dsa",
          "ecc": "/lessons/ecc/curves" // ECC is technically part of asymmetric but has its own scene in Phase 3.5
          // We can map others or show a "Work in Progress" toast
      };
      
      if (routes[id]) {
          router.push(routes[id]);
      } else {
          console.log("Modules coming soon for:", id);
      }
  };

  return (
    <Canvas
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 5, 20], fov: 35 }}
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
        
        {/* Render Clusters Dynamically */}
        {CURRICULUM.map((cluster) => (
            <TopicCluster 
                key={cluster.id}
                position={cluster.position}
                geometryType={cluster.geometry}
                color={cluster.color}
                label={cluster.label}
                locked={cluster.locked}
                onClick={() => handleTopicClick(cluster.id, cluster.locked)}
            />
        ))}

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
