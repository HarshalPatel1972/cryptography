"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { CurveGraph } from "@/features/ecc/CurveGraph";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export default function ECCLessonPage() {
  const [pX, setPX] = useState(-0.5);

  return (
    <LessonLayout
      title="Elliptic Curves (The Billiards)"
      description="ECC helps us add points. To add P + Q, we shoot a laser through them, hit the curve, and bounce vertically. This 'geometric trapdoor' is the foundation of modern security."
    >
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 40 }}
      >
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1} />
        
        <Suspense fallback={null}>
            <CurveGraph pX={pX} />
            <Preload all />
        </Suspense>

        <EffectComposer>
           <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.5} />
        </EffectComposer>

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>

      {/* Controls */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2">
         <label className="text-neon-cyan font-mono">MOVE POINT P</label>
         <input 
            type="range" 
            min="-1.2" 
            max="2.0" 
            step="0.01" 
            value={pX}
            onChange={(e) => setPX(parseFloat(e.target.value))}
            className="w-96 range-slider" // Need simple styles or default
         />
      </div>
    </LessonLayout>
  );
}
