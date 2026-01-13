"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { easing } from "maath";
import { Color } from "three";

interface TopicClusterProps {
  position: [number, number, number];
  geometryType: "box" | "sphere" | "cone" | "octahedron" | "torus" | "icosahedron" | "dodecahedron" | "tetrahedron";
  color: string;
  label: string;
  onClick?: () => void;
  locked?: boolean;
}

export function TopicCluster({ position, geometryType, color, label, onClick, locked = false }: TopicClusterProps) {
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
      const targetScale = hovered && !locked ? 1.2 : 1;
      easing.damp3(meshRef.current.scale, [targetScale, targetScale, targetScale], 0.15, delta);

      // 3. Position update
      meshRef.current.position.y = position[1] + floatY;
      
      // 4. Rotation
      meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      meshRef.current.rotation.y += locked ? 0.005 : 0.01;
    }

    if (materialRef.current) {
      // 5. Color Animation
      // If locked, it's a ghost (transparent gray/white or dimmed version of color)
      // If hovered, it glows white
      const baseColor = locked ? "#444444" : color;
      const targetColor = hovered && !locked ? new Color("#ffffff") : new Color(baseColor);
      const targetEmissive = hovered && !locked ? 0.5 : (locked ? 0 : 0.2);
      const targetOpacity = locked ? 0.3 : 0.9;
      
      easing.dampC(materialRef.current.color, targetColor, 0.15, delta);
      easing.dampC(materialRef.current.emissive, targetColor, 0.15, delta);
      easing.damp(materialRef.current, "emissiveIntensity", targetEmissive, 0.15, delta);
      easing.damp(materialRef.current, "opacity", targetOpacity, 0.15, delta);
    }
  });

  const handlePointerOver = () => {
    if (locked) return;
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
    octahedron: <octahedronGeometry args={[1, 0]} />,
    torus: <torusGeometry args={[0.8, 0.3, 16, 32]} />,
    icosahedron: <icosahedronGeometry args={[1, 0]} />,
    dodecahedron: <dodecahedronGeometry args={[1, 0]} />,
    tetrahedron: <tetrahedronGeometry args={[1, 0]} />,
  }[geometryType];

  return (
    <group position={position}>
      {/* Interactive Mesh */}
      <mesh
        ref={meshRef}
        onClick={!locked ? onClick : undefined}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {Geometry}
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          wireframe
          transparent
          opacity={locked ? 0.3 : 0.9}
        />
      </mesh>

      {/* Floating Label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color={hovered && !locked ? "#ffffff" : (locked ? "#666" : color)}
        anchorX="center"
        anchorY="middle"
      >
        {label + (locked ? " [LOCKED]" : "")}
      </Text>
    </group>
  );
}
