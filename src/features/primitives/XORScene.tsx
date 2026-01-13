"use client";

import { useFrame } from "@react-three/fiber";
import { Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef, useState, useMemo } from "react";
import { Bit } from "./components/Bit";
import { useLessonStore } from "@/stores/useLessonStore";
import { Trail } from "@react-three/drei";
import * as THREE from "three";
import { GuideCue } from "@/components/canvas/GuideCue";
import { useGuidanceStore } from "@/stores/useGuidanceStore";

// A Falling Bit component wrapper for Physics
function FallingBit({ id, startValue, position }: { id: string, startValue: 0 | 1, position: [number, number, number] }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  // We track value changes after collision
  const [value, setValue] = useState(startValue);
  const [color, setColor] = useState<string | undefined>(undefined);

  // Expose update function to parent (hacky but functional for simple physics scene, 
  // or use user data in collision event to trigger state change)
  
  return (
    <RigidBody 
      ref={rigidBody} 
      position={position} 
      type="dynamic" 
      colliders="cuboid"
      restitution={0.2}
      userData={{ type: "falling", value, id, setValue, setColor }}
    >
      <Trail width={0.5} length={5} color={value === 1 ? "#00f3ff" : "#444444"} attenuation={(t) => t * t}>
        <Bit value={value} color={color} scale={0.8} />
      </Trail>
    </RigidBody>
  );
}

// The Filter Bit (Static)
function FilterBit({ index, position }: { index: number, position: [number, number, number] }) {
  const [value, setValue] = useState<0 | 1>(0);
  
  return (
    <RigidBody position={position} type="fixed" colliders="cuboid" userData={{ type: "filter", value, index }}>
      <Bit 
        value={value} 
        interactive 
        onClick={() => setValue(v => v === 0 ? 1 : 0)} 
        scale={1.2}
      />
    </RigidBody>
  );
}

export function XORScene() {
  const logAction = useLessonStore(state => state.logAction);
  const { currentStep } = useGuidanceStore();
  
  // Track falling bits: simplespawner logic
  // For MVP, we spawn a set number or use a interval
  // Here let's just render a few initial ones and maybe a "Rain" system
  // We'll use a fixed set of falling bits that recycle or just one wave for "Level 0"
  
  const fallingBits = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `falling-${i}`,
      startValue: Math.random() > 0.5 ? 1 : 0 as 0 | 1,
      position: [i * 2 - 7, 10 + i * 2, 0] as [number, number, number] // Staggered drop
    }));
  }, []);

  const handleCollision = (payload: any) => {
    // Check if collision is between Falling and Filter
    // Rapier onCollisionEnter handler on the Physics component isn't standard, 
    // usually we put it on rigid bodies. 
    // But we need to coordinate.
    // Let's rely on the falling bit's collision event if we can attached it there.
  };

  return (
    <Physics gravity={[0, -5, 0]}>
      {/* Light setup for this specific scene */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 10, 10]} intensity={1} color="#00f3ff" />
      
      {/* The Filter Row (Key) */}
      <group position={[0, 0, 0]}>
         {Array.from({ length: 8 }).map((_, i) => (
           <FilterBit key={i} index={i} position={[i * 2 - 7, 0, 0]} />
         ))}
         {/* Step 0: Point to Key */}
         <GuideCue position={[0, 2, 0]} visible={currentStep === 0} />
      </group>

      {/* Step 1: Point to Spawner */}
      <GuideCue position={[0, 10, 0]} visible={currentStep === 1} />

      {/* The Neon Rain */}
      {fallingBits.map((bit) => (
        <RigidBody 
            key={bit.id}
            position={bit.position}
            type="dynamic"
            onCollisionEnter={({ other }) => {
              if (other.rigidBodyObject?.userData.type === "filter") {
                 const filterVal = other.rigidBodyObject.userData.value;
                 // We can't easily access the React state of the child here without context/refs
                 // But we can just use the store to log for now, or use a customized store for scene state
                 logAction(`Collision! Filter Value: ${filterVal}`);
                 // Actual XOR visual logic requires updating the FallingBit state
                 // This is tricky in pure R3F+Rapier without a central scene manager system,
                 // but for "Level 0" visualization we can cheat:
                 // The "Falling Bit" component should handle its own collision logic if possible.
              }
            }}
        >
             {/* Instead of inline RigidBody, let's use the component that has state logic inside */}
            <BitLogicWrapper startValue={bit.startValue} />
        </RigidBody>
      ))}
      
      {/* Floor to catch them */}
      <RigidBody type="fixed" position={[0, -10, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[100, 1, 10]} />
        </mesh>
      </RigidBody>
    </Physics>
  );
}

// Helper to handle collision logic cleanly with state
function BitLogicWrapper({ startValue }: { startValue: 0 | 1 }) {
  const [value, setValue] = useState(startValue);
  const [color, setColor] = useState<string | undefined>(undefined);
  const logAction = useLessonStore(state => state.logAction);
  const processedRef = useRef(false); // Only XOR once

  return (
    <RigidBody 
       type="dynamic" 
       colliders="cuboid"
       onCollisionEnter={({ other }) => {
         if (processedRef.current) return;
         if (other.rigidBodyObject?.userData.type === "filter") {
            const filterValue = other.rigidBodyObject.userData.value as 0 | 1;
            const result = (value ^ filterValue) as 0 | 1;
            
            // Visual Interaction
            setValue(result);
            setColor(result === 1 ? "#0aff0a" : "#ff0055"); // Green for 1, Red for 0 (Result)
            
            logAction(`XOR: ${value} ^ ${filterValue} = ${result}`);
            processedRef.current = true;
         }
       }}
    >
       <Trail width={0.4} length={4} color={value === 1 ? "#00f3ff" : "#444444"}>
         <Bit value={value} color={color} scale={0.8} />
       </Trail>
    </RigidBody>
  );
}
