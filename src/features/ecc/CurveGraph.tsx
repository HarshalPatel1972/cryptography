"use client";

import { useMemo, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Sphere, Text } from "@react-three/drei";
import { Vector3, Color } from "three";
import { easing } from "maath";

// Curve: y^2 = x^3 - x + 1
// Valid for x > -1.3247...
function solveY(x: number) {
    const val = x*x*x - x + 1;
    if (val < 0) return NaN;
    return Math.sqrt(val);
}

// Point Addition Logic
function addPoints(p1: {x: number, y: number}, p2: {x: number, y: number}) {
    // If P == Q (Doubling) or P != Q (Addition)
    // Slope m
    let m = 0;
    if (Math.abs(p1.x - p2.x) < 0.001 && Math.abs(p1.y - p2.y) < 0.001) {
        // Tangent: m = (3x^2 - 1) / 2y
        m = (3 * p1.x * p1.x - 1) / (2 * p1.y);
    } else {
        // Secant: m = (y2 - y1) / (x2 - x1)
        m = (p2.y - p1.y) / (p2.x - p1.x);
    }
    
    // Intersection x3 = m^2 - x1 - x2
    const x3 = m*m - p1.x - p2.x;
    // y3 on line: y - y1 = m(x - x1) => y3 = m(x3 - x1) + y1
    // Actually standard form y3 = m(x1 - x3) - y1
    const y3 = m * (p1.x - x3) - p1.y;
    
    return { x: x3, y: y3, m };
}

interface CurveGraphProps {
  pX: number; // User controlled X for Point P
}

export function CurveGraph({ pX }: CurveGraphProps) {
  // Generate curve points for static line
  const curvePoints = useMemo(() => {
      const pts = [];
      const resolution = 100;
      const startX = -1.3;
      const endX = 3.0;
      for (let i = 0; i <= resolution; i++) {
          const x = startX + (endX - startX) * (i / resolution);
          const y = solveY(x);
          if (!isNaN(y)) {
             pts.push(new Vector3(x, y, 0));
          }
      }
      // Bottom half
      for (let i = resolution; i >= 0; i--) {
          const x = startX + (endX - startX) * (i / resolution);
          const y = solveY(x);
          if (!isNaN(y)) {
             pts.push(new Vector3(x, -y, 0));
          }
      }
      return pts;
  }, []);

  // Calculate Active Points
  // P is controlled. Q is fixed at x = 0 for demo? 
  // Let's make Q fixed at x=0, y=1 (0^3 - 0 + 1 = 1, sqrt(1)=1). P and Q distinct.
  const P = { x: pX, y: solveY(pX) || 0 };
  const Q = { x: 0, y: 1 };
  
  const R_int = addPoints(P, Q); // Intersection R'
  const R_final = { x: R_int.x, y: -R_int.y }; // Reflected R
  
  // Laser Line Points (P -> Q -> R_int -> R_final)
  // Actually line goes through P and Q and hits R_int.
  // Then we drop vertical to R_final.
  // We need to extend the line beyond R_int for visual effect?
  // Let's draw segment P-Q-Extended.
  
  // Animate laser
  const laserRef = useRef<any>(null);
  
  useFrame((state, delta) => {
     // Animate R sphere pulsing?
  });

  return (
    <group scale={1.5}>
      {/* The Curve */}
      <Line points={curvePoints} color="#00ffff" lineWidth={3} opacity={0.5} transparent />
      
      {/* Axis */}
      <Line points={[[-2, 0, 0], [4, 0, 0]]} color="gray" lineWidth={1} />
      <Line points={[[0, -4, 0], [0, 4, 0]]} color="gray" lineWidth={1} />
      
      {/* Point P */}
      <group position={[P.x, P.y, 0]}>
         <Sphere args={[0.1]}>
            <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={1} />
         </Sphere>
         <Text position={[0, 0.2, 0]} fontSize={0.2} color="yellow">P</Text>
      </group>

      {/* Point Q */}
      <group position={[Q.x, Q.y, 0]}>
         <Sphere args={[0.1]}>
            <meshStandardMaterial color="blue" emissive="blue" emissiveIntensity={1} />
         </Sphere>
         <Text position={[0, 0.2, 0]} fontSize={0.2} color="blue">Q</Text>
      </group>
      
      {/* Intersection Line (Laser) */}
      {/* Draw from min X to max X based on P and Q projection */}
      <Line 
        points={[
            [P.x - (Q.x - P.x)*10, P.y - (Q.y - P.y)*10, 0], 
            [Q.x + (Q.x - P.x)*10, Q.y + (Q.y - P.y)*10, 0]
        ]} 
        color="#ff00ff" 
        lineWidth={1} 
        dashed 
      />

      {/* Point R (Intersection) */}
      <group position={[R_int.x, R_int.y, 0]}>
         <Sphere args={[0.08]}>
            <meshStandardMaterial color="red" />
         </Sphere>
         <Text position={[0, 0.2, 0]} fontSize={0.15} color="red">Inter</Text>
      </group>
      
      {/* Drop Line */}
      <Line points={[[R_int.x, R_int.y, 0], [R_int.x, R_final.y, 0]]} color="white" lineWidth={1} dashed dashScale={10} />

      {/* Final Point R */}
      <group position={[R_final.x, R_final.y, 0]}>
         <Sphere args={[0.15]}>
            <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
         </Sphere>
         <Text position={[0, -0.3, 0]} fontSize={0.3} color="#00ff00">P + Q</Text>
      </group>
    </group>
  );
}
