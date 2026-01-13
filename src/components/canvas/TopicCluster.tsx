"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { easing } from "maath";
import { Color } from "three";

interface TopicClusterProps {
  position: [number, number, number];
  geometryType: "box" | "sphere" | "cone";
  color: string;
  label: string;
  onClick?: () => void;
}

export function TopicCluster({ position, geometryType, color, label, onClick }: TopicClusterProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<any>(null);
  const materialRef = useRef<any>(null);

  // Floating animation offset
  const randomOffset = useRef(Math.random() * 100);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // 1. Gentle sine wave floating (always active)
      const t = state.clock.getElapsedTime();
      const floatY = Math.sin(t + randomOffset.current) * 0.2;
      
      // 2. Spring Scale Animation (Hover Effect)
      // damp(current, target, smoothTime, delta)
      const targetScale = hovered ? 1.2 : 1;
      easing.damp3(meshRef.current.scale, [targetScale, targetScale, targetScale], 0.15, delta);

      // 3. Position update (Base position + float)
      // We dampen the position return to original if needed, but here we just float around base
      meshRef.current.position.y = position[1] + floatY;
      
      // 4. Rotation
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }

    if (materialRef.current) {
      // 5. Color Animation (Hover Effect)
      const targetColor = hovered ? new Color("#ffffff") : new Color(color);
      const targetEmissive = hovered ? 0.5 : 0;
      
      easing.dampC(materialRef.current.color, targetColor, 0.15, delta);
      easing.dampC(materialRef.current.emissive, targetColor, 0.15, delta);
      easing.damp(materialRef.current, "emissiveIntensity", targetEmissive, 0.15, delta);
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  // Geometry selection
  const Geometry = {
    box: <boxGeometry args={[1.5, 1.5, 1.5]} />,
    sphere: <sphereGeometry args={[1, 32, 32]} />,
    cone: <coneGeometry args={[1, 2, 32]} />,
  }[geometryType];

  return (
    <group position={position}>
      {/* Interactive Mesh */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {Geometry}
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          wireframe
        />
      </mesh>

      {/* Floating Label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color={hovered ? "#ffffff" : color} // Instant color change for text is fine, or animate if needed
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}
