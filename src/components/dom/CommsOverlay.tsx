"use client";

import { useGuidanceStore } from "@/stores/useGuidanceStore";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function CommsOverlay() {
  const { isIdle, hintsEnabled } = useGuidanceStore();
  const [message, setMessage] = useState("");

  // Simple hint logic for V1 (Expand later)
  useEffect(() => {
    if (isIdle) {
      setMessage("HINT: Try interacting with the highlighted elements.");
    } else {
        // Clear or show default status
       setMessage("ESTABLISHING NEURAL LINK...");
       const timer = setTimeout(() => setMessage(""), 2000);
       return () => clearTimeout(timer);
    }
  }, [isIdle]);

  if (!hintsEnabled) return null;

  return (
    <AnimatePresence>
      {(isIdle || message) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-black/60 backdrop-blur-md border border-neon-cyan/50 px-6 py-2 rounded-full text-neon-cyan font-mono text-sm tracking-widest shadow-[0_0_15px_rgba(0,243,255,0.3)] flex items-center gap-3">
             <div className="w-2 h-2 bg-neon-cyan rounded-full animate-ping" />
             <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
