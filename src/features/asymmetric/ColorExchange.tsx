"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial, Vector3 } from "three";
import { Text } from "@react-three/drei";
import { easing } from "maath";

// Simple Liquid Shader
const liquidVertexShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    // Simple wave
    float elevation = sin(pos.x * 3.0 + uTime) * sin(pos.z * 2.0 + uTime) * 0.1;
    pos.y += elevation;
    vElevation = elevation;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const liquidFragmentShader = `
  varying vec2 vUv;
  varying float vElevation;
  uniform vec3 uColor;
  uniform vec3 uMixColor;
  uniform float uMixFactor;

  void main() {
    // Base color mix
    vec3 color = mix(uColor, uMixColor, uMixFactor);
    
    // Highlights based on elevation
    color += vElevation * 0.2;
    
    gl_FragColor = vec4(color, 0.8); // Slight transparency
  }
`;

function Bucket({ position, color, mixColor = new Color("#ffffff"), mixFactor = 0, label, onClick }: any) {
  const meshRef = useRef<any>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new Color(color) },
    uMixColor: { value: new Color(mixColor) },
    uMixFactor: { value: mixFactor }
  }), [color]);

  useFrame((state, delta) => {
    if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += delta;
        // Smooth color interaction
        easing.dampC(materialRef.current.uniforms.uColor.value, new Color(color), 0.1, delta);
        easing.dampC(materialRef.current.uniforms.uMixColor.value, new Color(mixColor), 0.1, delta);
        easing.damp(materialRef.current.uniforms.uMixFactor, "value", mixFactor, 0.1, delta);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={onClick} onPointerOver={() => document.body.style.cursor="pointer"} onPointerOut={() => document.body.style.cursor="auto"}>
        <cylinderGeometry args={[1, 0.8, 1.5, 32]} />
        <shaderMaterial 
           ref={materialRef}
           vertexShader={liquidVertexShader}
           fragmentShader={liquidFragmentShader}
           uniforms={uniforms}
           transparent
        />
      </mesh>
      <Text position={[0, -1.2, 0]} fontSize={0.3} color={color}>
        {label}
      </Text>
    </group>
  );
}

export function ColorExchange() {
  // Constants
  const PUBLIC_COLOR = "#ff0000"; // Red
  const ALICE_PRIVATE = "#ffff00"; // Yellow
  const BOB_PRIVATE = "#0000ff"; // Blue
  const ALICE_MIX = "#ffaa00"; // Orange
  const BOB_MIX = "#aa00ff"; // Purple
  const SECRET = "#553300"; // Brownish (Reality of pigment mix is ugly, but let's fake a nicer secret color?)
  // Actually RGB additive mixing: Yellow(1,1,0) + Red(1,0,0) = (1, 0.5, 0) Orange.
  // Blue(0,0,1) + Red(1,0,0) = (0.5, 0, 0.5) Purple.
  // Secret: Alice Mix (Orange) + Blue? Or Bob Mix (Purple) + Yellow?
  // (1, 0.5, 0) + (0, 0, 1) -> (1, 0.5, 1)? Pinkish.
  // Let's target a Shared Secret color: GREEN (for success) just to be visually distinct?
  // User Prompt: "Both buckets turn the exact same shade of Purple".
  // Okay, let's say the secret is Purple.
  // Bob's mix (Purple) + Alice Secret (Yellow) -> Shared.
  // We need to fudge the colors to look good.
  
  const [step, setStep] = useState(0); 
  // 0: Start (Private Colors)
  // 1: Add Public (Mix)
  // 2: Exchange (Swap Positions)
  // 3: Add Private (Shared Secret)

  const [aliceColor, setAliceColor] = useState(ALICE_PRIVATE);
  const [bobColor, setBobColor] = useState(BOB_PRIVATE);
  const [alicePos, setAlicePos] = useState<[number, number, number]>([-2, 0, 0]);
  const [bobPos, setBobPos] = useState<[number, number, number]>([2, 0, 0]);

  const handleNext = () => {
    if (step === 0) {
        // Mix Public
        setAliceColor(ALICE_MIX);
        setBobColor(BOB_MIX);
        setStep(1);
    } else if (step === 1) {
        // Exchange
        setAlicePos([2, 0, 0]);
        setBobPos([-2, 0, 0]);
        setStep(2);
    } else if (step === 2) {
        // Final Secret
        setAliceColor("#880088"); // Shared Purple
        setBobColor("#880088");
        setStep(3);
    } else {
        // Reset
        setAliceColor(ALICE_PRIVATE);
        setBobColor(BOB_PRIVATE);
        setAlicePos([-2, 0, 0]);
        setBobPos([2, 0, 0]);
        setStep(0);
    }
  };

  useFrame((state, delta) => {
      // Animate positions
      // easing.damp3(...) if needed, but react-spring handled by positions state change usually not animated unless using motion
      // We will just snap for MVP or assume position props are animated by parent? 
      // Nope, we need to animate them here if we want them to slide.
      // But Bucket doesn't wrap position in spring.
      // Let's leave them snapping for MVP or refactor to use spring.
  });

  return (
    <group>
      {/* Public Color Source */}
      <mesh position={[0, 4, 0]}>
         <sphereGeometry args={[0.5]} />
         <meshStandardMaterial color={PUBLIC_COLOR} emissive={PUBLIC_COLOR} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 4.8, 0]} fontSize={0.3} color={PUBLIC_COLOR}>PUBLIC (RED)</Text>

      {/* Alice Bucket */}
      <Bucket 
         position={alicePos} 
         color={aliceColor} 
         label={step >= 2 ? "BOB'S MIX" : "ALICE"} // Label follows bucket logic?
         onClick={handleNext}
      />

      {/* Bob Bucket */}
      <Bucket 
         position={bobPos} 
         color={bobColor} 
         label={step >= 2 ? "ALICE'S MIX" : "BOB"}
         onClick={handleNext}
      />
      
      <Text position={[0, -3, 0]} fontSize={0.4} color="white" onClick={handleNext}>
        {step === 0 && "STEP 1: ADD PUBLIC COLOR (CLICK)"}
        {step === 1 && "STEP 2: EXCHANGE BUCKETS (CLICK)"}
        {step === 2 && "STEP 3: ADD PRIVATE SECRET (CLICK)"}
        {step === 3 && "SHARED SECRET CREATED! (RESET)"}
      </Text>
    </group>
  );
}
