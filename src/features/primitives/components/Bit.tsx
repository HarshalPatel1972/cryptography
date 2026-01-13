"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { Color } from "three";
// import useSound from "use-sound"; // Uncomment when sfx available

interface BitProps {
  value: 0 | 1;
  interactive?: boolean;
  color?: string; // Override color
  position?: [number, number, number];
  onClick?: () => void;
  scale?: number;
}

export function Bit({ value, interactive = false, color, position = [0, 0, 0], onClick, scale = 1 }: BitProps) {
  const meshRef = useRef<any>(null);
  const materialRef = useRef<any>(null);
  const [internalValue, setInternalValue] = useState(value);
  
  // Sync internal state with prop
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClick = () => {
    if (!interactive) return;
    
    const newValue = internalValue === 0 ? 1 : 0;
    setInternalValue(newValue);
    // playSound();
    if (onClick) onClick();
  };

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    // 1. Color Logic
    const isOn = internalValue === 1;
    // Default colors: 1 = Neon Cyan (#00f3ff), 0 = Dark Graphite (#1a1a1a)
    // If color prop is provided, use it (e.g. green for correct)
    const activeColor = color ? color : (isOn ? "#00f3ff" : "#222222");
    // Emissive: Only glowing if ON or if specific color provided (like result)
    const targetEmissive = isOn || color ? 0.8 : 0; 
    const targetColor = new Color(activeColor);

    // Smooth transition for color and emissive
    easing.dampC(materialRef.current.color, targetColor, 0.1, delta);
    easing.dampC(materialRef.current.emissive, targetColor, 0.1, delta);
    easing.damp(materialRef.current, "emissiveIntensity", targetEmissive, 0.1, delta);

    // 2. Scale Animation (Pop effect on change)
    // We dampen towards base scale. Trigger a "pop" by manually setting scale > 1 on click/change (in event handler)
    // Here we just maintain the target scale
    // easing.damp3(meshRef.current.scale, [scale, scale, scale], 0.2, delta);
    
    // Slow rotation for visual flair
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={handleClick}
      onPointerOver={() => interactive && (document.body.style.cursor = "pointer")}
      onPointerOut={() => interactive && (document.body.style.cursor = "auto")}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        roughness={0.2}
        metalness={0.8}
        toneMapped={false} // Important for neon glow
      />
      {/* Inner wireframe for tech look */}
      <mesh scale={[1.01, 1.01, 1.01]}>
         <boxGeometry args={[1, 1, 1]} />
         <meshBasicMaterial wireframe color={internalValue === 1 ? "#ffffff" : "#444444"} transparent opacity={0.1} />
      </mesh>
    </mesh>
  );
}
