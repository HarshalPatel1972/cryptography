"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { LessonLayout } from "@/components/layout/LessonLayout";
import { DigitalSeal } from "@/features/signatures/DigitalSeal";
import { OrbitControls, Preload } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useLessonStore } from "@/stores/useLessonStore";

export default function SignaturesLessonPage() {
  const { logAction } = useLessonStore();
  const [text, setText] = useState("I, Alice, hereby transfer 100 BTC to Bob.");
  const [isSigned, setIsSigned] = useState(false);
  const [signedHash, setSignedHash] = useState("");
  const [isValid, setIsValid] = useState(true);

  // Wasm hash check
  useEffect(() => {
     if (!isSigned) return;

     async function checkIntegrity() {
        try {
            const wasm = await import("@/lib/wasm/crypto-engine/crypto_engine");
            await wasm.default();
            const currentHash = wasm.get_sha256(text);
            
            if (currentHash !== signedHash) {
                setIsValid(false);
                logAction("WARNING: Signature Mismatch! Document Tampered.");
            } else {
                setIsValid(true);
            }
        } catch (e) { console.error(e); }
     }
     checkIntegrity();
  }, [text, isSigned, signedHash]);

  const handleSign = async () => {
      try {
        const wasm = await import("@/lib/wasm/crypto-engine/crypto_engine");
        await wasm.default();
        const hash = wasm.get_sha256(text);
        setSignedHash(hash);
        setIsSigned(true);
        setIsValid(true);
        logAction("Document Signed. Private Key Applied.");
        logAction(`Signature Hash: ${hash.substring(0, 16)}...`);
      } catch (e) { console.error(e); }
  };

  return (
    <LessonLayout
      title="Digital Signatures (The Hologram)"
      description="A Digital Signature proves identity. It's like a wax seal, but mathematically unforgeable. If the document changes by even one byte, the seal breaks (turns Red)."
    >
      <Canvas
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 5, 5], fov: 50 }}
      >
        <color attach="background" args={["#111"]} />
        <ambientLight intensity={1} />
        <pointLight position={[5, 10, 5]} intensity={2} />
        
        <Suspense fallback={null}>
            <DigitalSeal 
                text={text} 
                onSign={handleSign} 
                isSigned={isSigned} 
                isValid={isValid} 
            />
            <Preload all />
        </Suspense>

        <EffectComposer>
           <Bloom luminanceThreshold={0.5} mipmapBlur intensity={0.5} />
        </EffectComposer>

        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>

      {/* Inputs */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex flex-col gap-4">
         <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-96 h-32 bg-black/80 border border-white/20 text-white p-4 font-mono text-sm rounded focus:outline-none focus:border-neon-green"
            placeholder="Document Text..."
         />
         {isSigned && (
             <div className={`text-center font-bold ${isValid ? "text-neon-green" : "text-red-500"}`}>
                 STATUS: {isValid ? "VALID SIGNATURE" : "INVALID (TAMPERED)"}
             </div>
         )}
      </div>
    </LessonLayout>
  );
}
