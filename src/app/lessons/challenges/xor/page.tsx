"use client";

import { LessonLayout } from "@/components/layout/LessonLayout";
import { XorChallenge } from "@/features/challenges/XorChallenge";
import { useLessonStore } from "@/stores/useLessonStore";
import { Canvas } from "@react-three/fiber";
import { Starfield } from "@/components/canvas/Starfield";

export default function XorChallengePage() {
  const { logAction } = useLessonStore();
  
  return (
    <LessonLayout
      title="CHALLENGE: BREACH THE CIPHER"
      description="You have intercepted a signal. The enemy is using a primitive single-byte XOR cipher. Brute force the key to decode the message."
      disableNext={true} // Only enable after win? Currently manual.
    >
      <Canvas>
         <color attach="background" args={["#000"]} />
         <Starfield />
      </Canvas>
      
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <XorChallenge onComplete={() => logAction("CHALLENGE COMPLETE. ACCESS GRANTED.")} />
      </div>
    </LessonLayout>
  );
}
