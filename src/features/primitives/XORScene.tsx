"use client";

import { useFrame } from "@react-three/fiber";
import { Physics, RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef, useState, useMemo } from "react";
import { Bit } from "./components/Bit";
import { useLessonStore } from "@/stores/useLessonStore";
import { Trail, Text, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { GuideCue } from "@/components/canvas/GuideCue";
import { useGuidanceStore } from "@/stores/useGuidanceStore";
import { TruthTableHUD } from "./components/TruthTableHUD";

// A Falling Bit component wrapper for Physics
function FallingBit({ id, startValue, position, slowMo }: { id: string, startValue: 0 | 1, position: [number, number, number], slowMo: boolean }) {
  const rigidBody = useRef<RapierRigidBody>(null);
  // We track value changes after collision
  const [value, setValue] = useState(startValue);
  const [color, setColor] = useState<string | undefined>(undefined);

  useFrame(() => {
     if (rigidBody.current) {
        // Simple manual slow-mo by damping velocity if enabled
        // Ideally we control physics time step, but Rapier's timeScale isn't reactive per body
        // We can just dampen velocity for effect
        if (slowMo) {
            const vel = rigidBody.current.linvel();
            rigidBody.current.setLinvel({ x: vel.x, y: Math.max(vel.y, -1), z: vel.z }, true);
        }
     }
  });

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

// The Filter Bit (Static) with Label
function FilterBit({ index, position }: { index: number, position: [number, number, number] }) {
  const [value, setValue] = useState<0 | 1>(0);
  
  return (
    <group position={position}>
        {/* Label for Key */}
        {index === 0 && (
            <Text position={[-2, 1.5, 0]} fontSize={0.5} color="#bc13fe" anchorX="right">
                INPUT B (KEY)
            </Text>
        )}
        
        <RigidBody type="fixed" colliders="cuboid" userData={{ type: "filter", value, index }}>
          <Bit 
            value={value} 
            interactive 
            onClick={() => setValue(v => v === 0 ? 1 : 0)} 
            scale={1.2}
          />
        </RigidBody>
    </group>
  );
}

export function XORScene() {
  const logAction = useLessonStore(state => state.logAction);
  const { currentStep } = useGuidanceStore();
  const [slowMo, setSlowMo] = useState(false);
  const [activeCollision, setActiveCollision] = useState<{ a: 0 | 1, b: 0 | 1, out: 0 | 1, pos: [number, number, number] } | null>(null);

  // Clear collision highlight after a moment
  useFrame(() => {
     if (activeCollision && Math.random() > 0.95) {
         setActiveCollision(null);
     }
  });
  
  const fallingBits = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: `falling-${i}`,
      startValue: Math.random() > 0.5 ? 1 : 0 as 0 | 1,
      position: [i * 2 - 7, 10 + i * 2, 0] as [number, number, number] 
    }));
  }, []);

  return (
    <>
    {/* HUD Controls */}
    <Html position={[-6, 5, 0]}>
        <div className="flex flex-col gap-2">
            <button 
                className={`px-4 py-2 border rounded font-mono font-bold transition-all ${slowMo ? "bg-neon-cyan text-black border-neon-cyan" : "bg-black/50 text-neon-cyan border-neon-cyan"}`}
                onClick={() => setSlowMo(!slowMo)}
            >
                {slowMo ? "⏸ SLOW-MO ACTIVE" : "▶ SLOW-MO"}
            </button>
            <div className="text-xs text-neon-green font-mono">
                {slowMo ? "TIME SCALE: 0.1x" : "TIME SCALE: 1.0x"}
            </div>
        </div>
    </Html>

    <TruthTableHUD lastResult={activeCollision} />

    {/* Connector Line */}
    {activeCollision && (
        <Line 
            points={[activeCollision.pos, [activeCollision.pos[0], activeCollision.pos[1] - 2, 0]]} // Simple vertical line for now
            color="white"
            lineWidth={2}
            dashed
        />
    )}

    <Physics gravity={[0, slowMo ? -1 : -5, 0]}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 10, 10]} intensity={1} color="#00f3ff" />
      
      {/* The Filter Row (Key) */}
      <group position={[0, 0, 0]}>
         {Array.from({ length: 8 }).map((_, i) => (
           <FilterBit key={i} index={i} position={[i * 2 - 7, 0, 0]} />
         ))}
         <GuideCue position={[0, 2, 0]} visible={currentStep === 0} />
      </group>

      <GuideCue position={[0, 10, 0]} visible={currentStep === 1} />

      {/* Input Label for Rain */}
      <Text position={[-8, 8, 0]} fontSize={0.5} color="#00f3ff" anchorX="right">
        INPUT A (DATA)
      </Text>

      {/* Falling Bits */}
      {fallingBits.map((bit) => (
        <RigidBody 
            key={bit.id}
            position={bit.position}
            type="dynamic"
            onCollisionEnter={({ other }) => {
              if (other.rigidBodyObject?.userData.type === "filter") {
                 const filterVal = other.rigidBodyObject.userData.value as 0 | 1;
                 // We can't access React state of the child falling bit directly here cleanly without Refs
                 // For now, we rely on the wrapper below to handle logic, 
                 // this just handles global event logging if needed
              }
            }}
        >
             <BitLogicWrapper 
                startValue={bit.startValue} 
                setActiveCollision={setActiveCollision}
             />
        </RigidBody>
      ))}
      
      <RigidBody type="fixed" position={[0, -10, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[100, 1, 10]} />
        </mesh>
      </RigidBody>
    </Physics>
    </>
  );
}

// Logic Wrapper
function BitLogicWrapper({ startValue, setActiveCollision }: { startValue: 0 | 1, setActiveCollision: (val: any) => void }) {
  const [value, setValue] = useState(startValue);
  const [color, setColor] = useState<string | undefined>(undefined);
  const logAction = useLessonStore(state => state.logAction);
  const processedRef = useRef(false);

  return (
    <RigidBody 
       type="dynamic" 
       colliders="cuboid"
       onCollisionEnter={({ other, manifold }) => {
         if (processedRef.current) return;
         if (other.rigidBodyObject?.userData.type === "filter") {
            const filterValue = other.rigidBodyObject.userData.value as 0 | 1;
            const result = (value ^ filterValue) as 0 | 1;
            
            setValue(result);
            setColor(result === 1 ? "#0aff0a" : "#ff0055");
            
            logAction(`XOR: ${value} ^ ${filterValue} = ${result}`);
            
            // Trigger HUD update
            setActiveCollision({
                a: value,
                b: filterValue,
                out: result,
                pos: [0,0,0] // Ideally get contact point
            });

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
