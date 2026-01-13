"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial, Vector3 } from "three";
import { Text, Html } from "@react-three/drei";
import { easing } from "maath";
import { useLessonStore } from "@/stores/useLessonStore";

// Hologram Shader (Procedural Noise)
const hologramVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const hologramFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uHash; // Seed for noise
  
  // Simplex Noise (Simplified)
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    return 42.0 * dot( m*m, vec3( dot(p.x,x0), dot(p.y,x12.xy), dot(p.z,x12.zw)) );
  }

  void main() {
    // Generate pattern based on uHash + UV + Time
    float noise = snoise(vUv * 5.0 + uHash) + snoise(vUv * 10.0 - uTime * 0.5) * 0.5;
    
    // Ring effect
    float dist = distance(vUv, vec2(0.5));
    float ring = smoothstep(0.4, 0.35, dist) * smoothstep(0.2, 0.3, dist);
    
    // Core glow
    float glow = 1.0 - smoothstep(0.0, 0.4, dist);
    
    // Combine
    float alpha = (ring + glow * 0.5 + noise * 0.2) * (1.0 - smoothstep(0.4, 0.45, dist));
    
    gl_FragColor = vec4(uColor + noise * 0.2, alpha);
  }
`;

interface DigitalSealProps {
  text: string;
  onSign?: () => void;
  isSigned: boolean;
  isValid: boolean;
}

export function DigitalSeal({ text, onSign, isSigned, isValid }: DigitalSealProps) {
  const sealRef = useRef<any>(null);
  const stamperRef = useRef<any>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const [animState, setAnimState] = useState(0); // 0: Idle, 1: Signing, 2: Signed

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new Color("#00ff00") },
    uHash: { value: 0 }
  }), []);

  // Update Shader
  useFrame((state, delta) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta;
        // Color transition logic
        const targetColor = isValid ? new Color("#00ff00") : new Color("#ff0000");
        easing.dampC(materialRef.current.uniforms.uColor.value, targetColor, 0.1, delta);
        
        // Hash shimmer
        // Just use text length as primitive hash seed for visuals
        materialRef.current.uniforms.uHash.value = text.length * 0.1; 
    }
    
    // Stamper Animation
    if (isSigned && animState === 0) {
        setAnimState(1); // Trigger down animation
    }
    
    if (stamperRef.current) {
        if (animState === 1) {
             // Move Down
             easing.damp3(stamperRef.current.position, [0, 0.2, 0], 0.2, delta);
             if (stamperRef.current.position.y < 0.3) {
                 setAnimState(2); // Hit paper
             }
        } else if (animState === 2) {
             // Move Up
             easing.damp3(stamperRef.current.position, [0, 1.5, 0], 0.2, delta);
        } else {
             // Idle Top
             easing.damp3(stamperRef.current.position, [0, 1.5, 0], 0.2, delta);
        }
    }
  });
  
  // Reset animation if unsigned
  useEffect(() => {
    if (!isSigned) setAnimState(0);
  }, [isSigned]);

  return (
    <group>
      {/* Document Paper */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
         <planeGeometry args={[3, 4]} />
         <meshStandardMaterial color="#eeeeee" />
      </mesh>
      
      {/* HTML Overlay for Text */}
      <Html position={[0, 1, 0]} transform rotation={[-Math.PI / 2, 0, 0]} scale={0.2}>
         <div className="w-80 h-96 p-4 text-black font-mono text-sm overflow-hidden select-none pointer-events-none">
            <h1 className="text-xl font-bold mb-4 border-b border-black">CONTRACT</h1>
            <p>{text}</p>
         </div>
      </Html>

      {/* The Stamper Tool */}
      <group ref={stamperRef} position={[0, 1.5, 0]}>
         <mesh>
            <cylinderGeometry args={[0.3, 0.3, 1]} />
            <meshStandardMaterial color="#333" roughness={0.5} metalness={0.8} />
         </mesh>
         <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 0.1]} />
            <meshStandardMaterial color="#gold" metalness={1} roughness={0.2} />
         </mesh>
      </group>

      {/* The Holographic Seal */}
      {isSigned && (animState === 2 || animState === 1) && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 1]}>
             <planeGeometry args={[0.8, 0.8]} />
             <shaderMaterial 
                ref={materialRef}
                vertexShader={hologramVertexShader}
                fragmentShader={hologramFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
             />
          </mesh>
      )}
      
      {/* Sign Button in 3D Space (if not HTML) */}
      {!isSigned && (
         <Text position={[2, 0, 0]} fontSize={0.3} onClick={onSign} color="#00ff00">
            [ CLICK TO SIGN ]
         </Text>
      )}
    </group>
  );
}
