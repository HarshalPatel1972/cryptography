"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color } from "three";
import { Text } from "@react-three/drei";
import { easing } from "maath";
// import gsap from "gsap"; // Using maath for simpler state integration

// 4x4 Grid Layout
// Indices 0-15. 
// Row 0: 0, 4, 8, 12 (Col major?)
// Visual Grid: x=col, y=row.
// Row 0 (Top): y=1.5. Row 3 (Bottom): y=-1.5.
// Col 0 (Left): x=-1.5. Col 3 (Right): x=1.5.

interface AESCubeProps {
  keyHex?: string;
  plaintextHex?: string;
  autoPlay?: boolean;
}

const DEFAULT_KEY = "000102030405060708090a0b0c0d0e0f";
const DEFAULT_TEXT = "00112233445566778899aabbccddeeff"; // State array

export function AESCube({ keyHex = DEFAULT_KEY, plaintextHex = DEFAULT_TEXT, autoPlay = false }: AESCubeProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const [roundsData, setRoundsData] = useState<any[]>([]); // Array of 16-byte arrays
  const [currentRound, setCurrentRound] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Current Visual Positions (for ShiftRows animation)
  // Maps logical index (0-15) to visual (x, y) offset
  // shiftOffsets[i] = x_offset
  const shiftOffsets = useRef(new Float32Array(16).fill(0));
  
  // Effect: Load Wasm and get simplified rounds
  useEffect(() => {
    async function load() {
      try {
        const wasm = await import("@/lib/wasm/crypto-engine/crypto_engine");
        await wasm.default();
        // Wasm returns array of Uint8Arrays (16 bytes each)
        const data = wasm.get_aes_rounds(keyHex, plaintextHex); 
        console.log("AES Data:", data);
        setRoundsData(data);
      } catch (e) {
        console.error("Wasm load error:", e);
      }
    }
    load();
  }, [keyHex, plaintextHex]);

  // Logic: Calculate standard grid positions
  // We use indices 0-15.
  // Visual layout: 
  // 0  4  8 12
  // 1  5  9 13
  // 2  6 10 14
  // 3  7 11 15
  // (Assuming Column-Major from Rust lib)
  // Let's store them as (row, col)
  const getBasePosition = (i: number) => {
    const row = i % 4; // 0, 1, 2, 3
    const col = Math.floor(i / 4); // 0, 1, 2, 3
    // Map to 3D space. Spacing 1.1
    // x: (col - 1.5) * 1.2
    // y: (1.5 - row) * 1.2 (Top to Bottom)
    return {
      x: (col - 1.5) * 1.2,
      y: (1.5 - row) * 1.2,
      z: 0
    };
  };

  useFrame((state, delta) => {
    if (!meshRef.current || roundsData.length === 0) return;

    // Get current round state (bytes)
    const currentBytes = roundsData[currentRound] || roundsData[0];
    
    // Animate transition to next round if needed
    // Actually we just display the state. The "ShiftRows" animation happens *between* states.
    // For MVP "First Slice", we will just animate the COLOR based on the byte value
    // and hold positions steady unless we explicitly animate shift rows (complex).
    
    // Render Loop
    for (let i = 0; i < 16; i++) {
        const { x, y, z } = getBasePosition(i);
        
        // Apply position
        dummy.position.set(x + shiftOffsets.current[i], y, z);
        dummy.scale.set(0.9, 0.9, 0.9);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);

        // Apply Color
        // Value 0-255. Map to hue/intensity?
        // Let's map byte value to Hue.
        const val = currentBytes[i];
        // Hue: val / 255. Sat: 1, Light: 0.5
        const color = new Color().setHSL(val / 255, 1, 0.5);
        meshRef.current.setColorAt(i, color);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  const nextStep = () => {
    if (currentRound < roundsData.length - 1) {
        // Trigger generic "glitch" or shift effect here if we had `gsap`
        setCurrentRound(c => c + 1);
    } else {
        setCurrentRound(0); // Loop
    }
  };

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, 16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.1} metalness={0.8} />
      </instancedMesh>
      
      {/* Controls Overlay in 3D Space? Or just use LessonLayout logic */}
      <Text position={[0, -3.5, 0]} fontSize={0.5} onClick={nextStep} color="white">
        {currentRound === 0 ? "START ENCRYPTION" : `ROUND ${currentRound} (NEXT)`}
      </Text>
      
      <Text position={[0, 4, 0]} fontSize={0.3} color="#00f3ff">
        AES-128 STATE (4x4)
      </Text>
    </group>
  );
}
