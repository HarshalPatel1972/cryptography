"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle, ArrowRight, Brain, Shield, Key, FileDigit, Fingerprint, Activity, Network, Box } from "lucide-react";
import { Module } from "@/lib/constants/curriculum";

interface ModuleCardProps {
  module: Module;
  clusterColor: string;
  onClick: () => void;
}

// Icon mapper based on keywords or IDs
const getIcon = (id: string) => {
    if (id.includes("xor")) return Brain;
    if (id.includes("aes") || id.includes("des") || id.includes("chacha")) return Shield;
    if (id.includes("dh") || id.includes("rsa") || id.includes("ecc")) return Key;
    if (id.includes("hash") || id.includes("hmac") || id.includes("md5")) return Fingerprint;
    if (id.includes("sign") || id.includes("cert") || id.includes("tls")) return FileDigit;
    if (id.includes("zkp") || id.includes("homo")) return Activity;
    if (id.includes("block") || id.includes("merkle")) return Box;
    return Network;
};

export function ModuleCard({ module, clusterColor, onClick }: ModuleCardProps) {
  const Icon = getIcon(module.id);
  const isLocked = module.locked;

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={`relative group p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-pointer ${
        isLocked 
          ? "border-white/5 bg-white/5 opacity-60 cursor-not-allowed" 
          : "border-white/10 bg-white/50 hover:bg-black/40 hover:border-[--cluster-color]"
      }`}
      style={{ 
        "--cluster-color": clusterColor 
      } as any}
    >
      {/* Glow Effect on Hover */}
      {!isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-[--cluster-color] to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl -z-10" />
      )}

      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${isLocked ? "bg-white/5 text-white/20" : "bg-[--cluster-color] bg-opacity-20 text-[--cluster-color]"}`}>
           <Icon size={20} />
        </div>
        {isLocked ? (
            <Lock size={16} className="text-white/20" />
        ) : (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[--cluster-color]">
                <ArrowRight size={16} />
            </div>
        )}
      </div>

      <h3 className={`font-bold text-sm tracking-wide mb-1 ${isLocked ? "text-white/40" : "text-white group-hover:text-[--cluster-color] transition-colors"}`}>
         {module.title}
      </h3>
      
      {/* We could add a description to the module type if available, for now using a placeholder if needed or just title */}
      {/* For UX "Don't make me think", Titles are often enough if descriptive. 
          Let's verify curriculum.ts has descriptions? It does not have module descriptions, only cluster descriptions.
          We will stick to Title for now. */}
          
      {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
             <span className="text-[10px] font-mono tracking-widest text-white/50 bg-black/80 px-2 py-1 rounded border border-white/10">
                 COMING SOON
             </span>
          </div>
      )}
    </motion.div>
  );
}
