"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { HashMirror } from "@/features/hashing/HashMirror";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";

export default function HashLessonPage() {
  const [inputText, setInputText] = useState("Hello");

  return (
    <LessonLayout
      title="The Shattering Mirror (Hashing)"
      description="A Hash Function maps data of any size to a fixed string. The 'Avalanche Effect' means a tiny change (e.g. 'Hello' -> 'Hellp') should drastically change the output. Here, the mirror SHATTERS when the hash changes."
    >
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 12], fov: 40 }}
      >
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
             <HashMirror inputText={inputText} />
          </Physics>
          <Preload all />
        </Suspense>

        <EffectComposer>
           <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.5} />
        </EffectComposer>
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
      
      {/* Input Overlay */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
         <input 
           type="text" 
           value={inputText}
           onChange={(e) => setInputText(e.target.value)}
           className="bg-black/80 border border-neon-cyan text-neon-cyan px-6 py-4 rounded text-xl w-96 text-center focus:outline-none focus:ring-2 focus:ring-neon-cyan transition-all"
           placeholder="Type something..."
         />
      </div>
    </LessonLayout>
  );
}
