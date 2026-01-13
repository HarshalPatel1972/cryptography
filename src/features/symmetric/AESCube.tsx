"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color, TextureLoader, Texture } from "three";
import { Text, useCursor, Html } from "@react-three/drei";
import { easing } from "maath";

const DEFAULT_KEY = "000102030405060708090a0b0c0d0e0f";
const DEFAULT_TEXT = "00112233445566778899aabbccddeeff"; 

export function AESCube({ keyHex = DEFAULT_KEY, plaintextHex = DEFAULT_TEXT }: { keyHex?: string, plaintextHex?: string }) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const [roundsData, setRoundsData] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [keyInserted, setKeyInserted] = useState(false);
  const [xRayMode, setXRayMode] = useState(false);
  
  // -- TEXTURE GENERATION (Procedural "Secret Image") --
  const secretTexture = useMemo(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      // Background
      ctx.fillStyle = '#bc13fe';
      ctx.fillRect(0,0,256,256);
      // Face
      ctx.fillStyle = '#00f3ff';
      ctx.beginPath();
      ctx.arc(128, 128, 80, 0, Math.PI*2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(90, 100, 10, 0, Math.PI*2);
      ctx.arc(166, 100, 10, 0, Math.PI*2);
      ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(128, 128, 50, 0.2, Math.PI - 0.2);
      ctx.stroke();
      // Text
      ctx.fillStyle = '#fff';
      ctx.font = '20px monospace';
      ctx.fillText("SECRET", 90, 200);
      
      return new Texture(canvas);
  }, []);
  
  useEffect(() => {
      secretTexture.needsUpdate = true;
  }, [secretTexture]);

  // -- WASM LOAD --
  useEffect(() => {
    async function load() {
      try {
        const wasm = await import("@/lib/wasm/crypto-engine/crypto_engine");
        await wasm.default();
        const data = wasm.get_aes_rounds(keyHex, plaintextHex); 
        setRoundsData(data);
      } catch (e) {
        console.error("Wasm load error:", e);
      }
    }
    load();
  }, [keyHex, plaintextHex]);

  // -- ANIMATION LOOP --
  useFrame((state, delta) => {
    if (!meshRef.current || roundsData.length === 0) return;

    const currentBytes = roundsData[currentRound] || roundsData[0];
    
    // We update the instance matrix to scramble positions based on byte values if round > 0
    // OR just change colors/UVs.
    // For "Image Scramble", we want the cubes to move or rotate.
    // Let's stick to the color/position logic but mapped to texture coordinates if we could.
    // Since we are using instancedMesh, UV mapping across instances is tricky without custom shader.
    // Simplified approach: Map each cube to a slice of the texture? 
    // Hard with standard material. 
    // Alternative: Just toggle between "Image Mode" (Round 0) and "Noise Mode" (Round > 0).
    
    // Position Logic
    for (let i = 0; i < 16; i++) {
        // Standard Grid
        const row = i % 4; 
        const col = Math.floor(i / 4);
        
        let x = (col - 1.5) * 1.1;
        let y = (1.5 - row) * 1.1;
        let z = 0;

        // Scramble Effect: Based on byte value difference from original
        if (currentRound > 0 && !xRayMode) {
            const val = currentBytes[i];
            const noiseX = Math.sin(val + state.clock.elapsedTime) * 0.2;
            x += noiseX;
        }

        dummy.position.set(x, y, z);
        dummy.rotation.x = xRayMode ? 0 : (currentRound * Math.PI * 0.5); // Rotate as rounds progress
        dummy.scale.set(0.9, 0.9, 0.9);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        // Color Logic
        const val = currentBytes[i];
        // If Round 0 (Plaintext) and Key Inserted -> Show clean structure.
        // If X-Ray -> Show raw byte color (Grayscale/Blue)
        // If Encrypting -> Scramble colors
        
        const targetColor = new Color();
        if (xRayMode) {
             targetColor.setHSL(0.6, 1, val/255); // Blue heatmap
        } else if (currentRound === 0) {
             // Initial "Image" state logic approximation
             // We can't do real texture mapping easily on instances without custom shader attributes.
             // Fallback: Just coloring them to look like a pattern
             targetColor.setHSL(i/16, 1, 0.5); // Rainbow sort
        } else {
             // Noise
             targetColor.setHSL(val/255, 1, 0.5); 
        }
        
        meshRef.current.setColorAt(i, targetColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  const nextStep = () => {
    if (!keyInserted) return; // Prevent action if key missing
    
    if (currentRound < roundsData.length - 1) {
        setCurrentRound(c => c + 1);
    } else {
        setCurrentRound(0); // Decrypt/Reset
    }
  };

  return (
    <group>
      {/* 1. THE GRID */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, 16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.8} 
            transparent={xRayMode} 
            opacity={xRayMode ? 0.3 : 1} 
            map={!xRayMode && currentRound === 0 ? secretTexture : null} // Try to apply texture globally (won't map perfectly to grid but better than nothing)
        />
      </instancedMesh>

      {/* 2. THE PHYSICAL KEY */}
      <KeyObject 
         inserted={keyInserted} 
         onClick={() => setKeyInserted(!keyInserted)} 
      />

      {/* 3. X-RAY TOGGLE HUD */}
      <Html position={[3, 2, 0]}>
          <div className="flex flex-col gap-2">
             <button
                className={`px-3 py-1 border rounded font-mono text-xs transition-all ${xRayMode ? "bg-neon-cyan text-black" : "text-neon-cyan border-neon-cyan"}`}
                onClick={() => setXRayMode(!xRayMode)}
             >
                {xRayMode ? "X-RAY: ON" : "X-RAY: OFF"}
             </button>
             
             {!keyInserted && (
                 <div className="text-red-500 font-bold bg-black/80 px-2 rounded animate-pulse">
                    ⚠ INSERT KEY
                 </div>
             )}
          </div>
      </Html>

      {/* 4. ROUND CONTROLLER */}
      <Text 
        position={[0, -3.5, 0]} 
        fontSize={0.5} 
        onClick={nextStep} 
        color={keyInserted ? "white" : "#444"}
      >
        {currentRound === 0 ? "START ENCRYPTION" : `ROUND ${currentRound} (NEXT)`}
      </Text>
      
      <Text position={[0, 4, 0]} fontSize={0.3} color="#00f3ff">
        AES-128: {currentRound === 0 ? "PLAINTEXT" : (currentRound === 10 ? "CIPHERTEXT" : "SCRAMBLING...")}
      </Text>
    </group>
  );
}

function KeyObject({ inserted, onClick }: { inserted: boolean, onClick: () => void }) {
    const [hovered, setHover] = useState(false);
    useCursor(hovered);
    
    const pos: [number, number, number] = inserted ? [-3, 0, 0] : [-3, -4, 2]; // Slot vs Table
    const rot: [number, number, number] = inserted ? [0, 0, Math.PI/2] : [0, 0, 0];
    const color = inserted ? "#0aff0a" : "#ffaa00";

    useFrame((state, delta) => {
        easing.damp3(Ref.current.position, pos, 0.2, delta);
        easing.damp3(Ref.current.rotation, rot, 0.2, delta);
        easing.dampC(mat.current.color, color, 0.2, delta);
    });

    const Ref = useRef<any>(null);
    const mat = useRef<any>(null);

    return (
        <group ref={Ref} onClick={onClick} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            {/* USB Stick Body */}
            <mesh>
                <boxGeometry args={[2, 0.5, 0.2]} />
                <meshStandardMaterial ref={mat} color={color} />
            </mesh>
            {/* Connector */}
            <mesh position={[1.2, 0, 0]}>
                <boxGeometry args={[0.5, 0.4, 0.1]} />
                <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
            </mesh>
            <Text position={[0, 0.5, 0]} fontSize={0.2} color="white">
                AES KEY (CLICK)
            </Text>
        </group>
    )
}
