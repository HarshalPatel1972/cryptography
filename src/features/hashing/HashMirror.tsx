"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, Text } from "@react-three/drei";
import { RigidBody, CuboidCollider, RapierRigidBody } from "@react-three/rapier";
import { useLessonStore } from "@/stores/useLessonStore";
// import useSound from "use-sound";

interface HashMirrorProps {
  inputText: string;
}

export function HashMirror({ inputText }: HashMirrorProps) {
  const [hash, setHash] = useState("");
  const [shards, setShards] = useState<any[]>([]); // Array of shard positions/velocities?
  const [isShattered, setIsShattered] = useState(false);
  const mirrorBody = useRef<RapierRigidBody>(null);
  
  const { logAction } = useLessonStore();

  // Load Wasm SHA256 logic
  useEffect(() => {
    async function updateHash() {
      if (!inputText) return;
      try {
         const wasm = await import("@/lib/wasm/crypto-engine/crypto_engine");
         await wasm.default();
         const newHash = wasm.get_sha256(inputText);
         
         if (newHash !== hash && hash !== "") {
             shatter();
             logAction(`Avalanche! Hash change detected.`);
             logAction(`Hash: ${newHash.substring(0, 16)}...`);
         } else if (hash === "") {
             logAction(`Initial Hash: ${newHash.substring(0, 16)}...`);
         }
         
         setHash(newHash);
      } catch (e) {
         console.error(e);
      }
    }
    updateHash();
  }, [inputText]);

  const shatter = () => {
    if (isShattered) return;
    setIsShattered(true);
    // playSound();
    
    // Spawn shards
    const newShards = [];
    for (let i = 0; i < 20; i++) {
        newShards.push({
            id: i,
            position: [(Math.random() - 0.5) * 5, (Math.random()) * 5, 0],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
        });
    }
    setShards(newShards);

    // Reset after 2 seconds
    setTimeout(() => {
        setIsShattered(false);
        setShards([]);
    }, 2000);
  };

  return (
    <group>
      {/* The Mirror (Solid State) */}
      {!isShattered && (
        <RigidBody ref={mirrorBody} type="fixed" colliders="cuboid" position={[0, 2.5, 0]}>
          <mesh>
            <boxGeometry args={[6, 4, 0.2]} />
            <MeshReflectorMaterial
                mirror={1}
                blur={[300, 100]}
                resolution={1024}
                mixBlur={1}
                mixStrength={50}
                roughness={0.1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#202020"
                metalness={0.8}
            />
          </mesh>
          <Text position={[0, 0, 0.11]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" maxWidth={5}>
             {hash ? hash.substring(0, 32) : "Type setup..."}
             {hash ? "\n" + hash.substring(32, 64) : ""}
          </Text>
        </RigidBody>
      )}

      {/* The Shards (Shattered State) */}
      {isShattered && shards.map((shard) => (
        <RigidBody 
           key={shard.id} 
           position={shard.position} 
           rotation={shard.rotation}
           colliders="cuboid"
           linearVelocity={[(Math.random()-0.5)*10, (Math.random())*5, (Math.random())*5]}
           angularVelocity={[Math.random()*10, Math.random()*10, 0]}
        >
           <mesh>
             <boxGeometry args={[1, 1, 0.1]} />
             <meshStandardMaterial color="#333" roughness={0.1} metalness={0.9} />
           </mesh>
        </RigidBody>
      ))}
      
      {/* Floor */}
      <RigidBody type="fixed" position={[0, -2, 0]}>
         <mesh rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <meshStandardMaterial color="#111" />
         </mesh>
      </RigidBody>
    </group>
  );
}
