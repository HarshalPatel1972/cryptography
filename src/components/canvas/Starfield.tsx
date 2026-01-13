"use client";

import { useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

// Starfield component: Generates a rotating sphere of particles
export function Starfield(props: any) {
  const ref = useRef<any>(null);
  // Generate 5000 points inside a sphere of radius 1.2
  const [sphere] = useState(() =>
    random.inSphere(new Float32Array(5000 * 3), { radius: 1.2 })
  );

  // Animate rotation
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points
        ref={ref}
        positions={sphere}
        stride={3}
        frustumCulled={false}
        {...props}
      >
        <PointMaterial
          transparent
          color="#f272c8" // Base neon pinkish color, will be affected by bloom
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}
