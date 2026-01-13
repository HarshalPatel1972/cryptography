"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial } from "three";
import { Text, Html } from "@react-three/drei";
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

function Bucket({ position, color, mixColor = new Color("#ffffff"), mixFactor = 0, label, mathLabel, onClick }: any) {
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
      <Text position={[0, -1.2, 0]} fontSize={0.3} color="white">
        {label}
      </Text>
      
      {/* MATH LABEL (Floating Top) */}
      <Html position={[0, 1.5, 0]} center>
         <div className="bg-black/50 backdrop-blur px-2 py-1 rounded border border-white/20 text-neon-cyan font-mono text-sm">
             {mathLabel}
         </div>
      </Html>
    </group>
  );
}

export function ColorExchange() {
  const PUBLIC_COLOR = "#ff0000"; // Red
  const ALICE_PRIVATE = "#ffff00"; // Yellow
  const BOB_PRIVATE = "#0000ff"; // Blue
  const ALICE_MIX = "#ffaa00"; // Orange
  const BOB_MIX = "#aa00ff"; // Purple

  const [step, setStep] = useState(0); 

  const [aliceColor, setAliceColor] = useState(ALICE_PRIVATE);
  const [bobColor, setBobColor] = useState(BOB_PRIVATE);
  // Math Labels State
  const [aliceMath, setAliceMath] = useState("a (Private)");
  const [bobMath, setBobMath] = useState("b (Private)");
  const [equation, setEquation] = useState("START: Key Generation");

  const [alicePos, setAlicePos] = useState<[number, number, number]>([-2, 0, 0]);
  const [bobPos, setBobPos] = useState<[number, number, number]>([2, 0, 0]);

  const handleNext = () => {
    if (step === 0) {
        // Mix Public
        setAliceColor(ALICE_MIX);
        setBobColor(BOB_MIX);
        setAliceMath("A = g^a mod p");
        setBobMath("B = g^b mod p");
        setEquation("STEP 1: Mix Private Key with Public Standard (g)");
        setStep(1);
    } else if (step === 1) {
        // Exchange
        setAlicePos([2, 0, 0]);
        setBobPos([-2, 0, 0]);
        setEquation("STEP 2: Exchange Public Keys across the network");
        setStep(2);
    } else if (step === 2) {
        // Final Secret
        setAliceColor("#880088"); 
        setBobColor("#880088");
        setAliceMath("S = B^a mod p");
        setBobMath("S = A^b mod p");
        setEquation("STEP 3: Calculate Shared Secret");
        setStep(3);
    } else {
        // Reset
        setAliceColor(ALICE_PRIVATE);
        setBobColor(BOB_PRIVATE);
        setAlicePos([-2, 0, 0]);
        setBobPos([2, 0, 0]);
        setAliceMath("a (Private)");
        setBobMath("b (Private)");
        setEquation("START: Key Generation");
        setStep(0);
    }
  };

  return (
    <group>
      {/* Public Color Source */}
      <mesh position={[0, 4, 0]}>
         <sphereGeometry args={[0.5]} />
         <meshStandardMaterial color={PUBLIC_COLOR} emissive={PUBLIC_COLOR} emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 4.8, 0]} fontSize={0.3} color={PUBLIC_COLOR}>PUBLIC (g)</Text>

      {/* EQUATION BANNER */}
      <Html position={[0, 3, 0]} center>
          <div className="bg-black/80 border border-neon-purple px-4 py-2 rounded-full text-white font-mono min-w-[300px] text-center shadow-[0_0_15px_rgba(188,19,254,0.3)]">
             {equation}
          </div>
      </Html>

      {/* Alice Bucket */}
      <Bucket 
         position={alicePos} 
         color={aliceColor} 
         label={step >= 2 ? "BOB'S MIX" : "ALICE"} 
         mathLabel={aliceMath}
         onClick={handleNext}
      />

      {/* Bob Bucket */}
      <Bucket 
         position={bobPos} 
         color={bobColor} 
         label={step >= 2 ? "ALICE'S MIX" : "BOB"}
         mathLabel={bobMath}
         onClick={handleNext}
      />
      
      {/* GIANT NUMBER REVEAL */}
      {step === 3 && (
          <Html position={[0, -2, 0]} center>
              <div className="text-4xl font-bold text-neon-green animate-bounce drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">
                  4,294,967,296
              </div>
              <div className="text-xs text-center text-white/50 mt-1">SHARED SECRET (INTEGER)</div>
          </Html>
      )}

      <Text position={[0, -4, 0]} fontSize={0.4} color="white" onClick={handleNext}>
        CLICK BUCKETS TO PROCEED
      </Text>
    </group>
  );
}
