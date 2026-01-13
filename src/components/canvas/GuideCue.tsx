import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Mesh } from "three";

interface GuideCueProps {
  position: [number, number, number];
  visible?: boolean;
}

export function GuideCue({ position, visible = true }: GuideCueProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Rotation
    meshRef.current.rotation.y += 0.02;
    // Color pulsing handled by material or just keep it simple logic first
  });

  if (!visible) return null;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* Chevron (Cone pointing down) */}
        <mesh ref={meshRef} position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.5, 4]} />
          <meshBasicMaterial color="#0aff0a" wireframe={true} transparent opacity={0.8} />
        </mesh>
        
        {/* Inner Core */}
        <mesh position={[0, 0.5, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshBasicMaterial color="#00f3ff" />
        </mesh>
      </group>
    </Float>
  );
}
