"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { XORScene } from "@/features/primitives/XORScene";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
export default function XORLessonPage() {
  const { setActiveLesson, setStep } = useGuidanceStore();
  
  // Initialize Guidance
  useEffect(() => {
    setActiveLesson('xor');
    setStep(0); // Start at step 0
  }, []);

  return (
    <LessonLayout
      title="The Neon Rain (XOR)"
      description="In the digital realm, everything is born from 0 and 1. The Exclusive OR (XOR) gate is the DNA of encryption. Rule: If bits are DIFFERENT, the result is 1. If SAME, the result is 0."
    >
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 15], fov: 45 }}
      >
        <color attach="background" args={["#050505"]} />
        
        <Suspense fallback={null}>
          <XORScene />
          <Preload all />
        </Suspense>

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
        </EffectComposer>

        {/* Allow looking around but restrict movement */}
        <OrbitControls 
           enableZoom={true} 
           enablePan={false}
           maxPolarAngle={Math.PI / 2}
           minPolarAngle={Math.PI / 4}
           target={[0, 0, 0]}
        />
      </Canvas>
    </LessonLayout>
  );
}
