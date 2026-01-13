"use client";

import { useLessonStore } from "@/stores/useLessonStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { CURRICULUM, Cluster } from "@/lib/constants/curriculum";

export function SyllabusOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const playClick = useLessonStore((state) => state.logAction); // Or sound hook if imported

  return (
    <>
      {/* HUD Trigger Button */}
      <button 
        className="fixed top-8 left-8 z-50 flex items-center gap-2 group"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-10 h-10 border border-neon-cyan/50 rounded-full flex items-center justify-center bg-black/20 backdrop-blur group-hover:bg-neon-cyan/20 transition-all">
           <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="bg-neon-cyan rounded-sm" />
              <div className="bg-neon-cyan/50 rounded-sm" />
              <div className="bg-neon-cyan/50 rounded-sm" />
              <div className="bg-neon-cyan/10 rounded-sm" />
           </div>
        </div>
        <div className="flex flex-col items-start translate-x-[-10px] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <span className="text-neon-cyan text-xs font-bold tracking-widest">SYLLABUS</span>
            <span className="text-white/50 text-[10px]">FULL_DB_ACCESS</span>
        </div>
      </button>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-y-auto"
           >
              {/* Close Button */}
              <button 
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                [ CLOSE_DB ]
              </button>

              <div className="w-full max-w-5xl p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {/* Header */}
                 <div className="col-span-full mb-8 text-center">
                    <h2 className="text-4xl font-bold tracking-[0.5em] text-neon-cyan mb-2">THE ARCHIVE</h2>
                    <p className="text-white/50 font-mono text-sm max-w-xl mx-auto">
                        Access the complete knowledge graph of cryptography. Modules marked as [LOCKED] effectively represent future learning nodes.
                    </p>
                 </div>

                 {/* Clusters */}
                 {CURRICULUM.map((cluster) => (
                    <ClusterCard key={cluster.id} cluster={cluster} />
                 ))}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ClusterCard({ cluster }: { cluster: Cluster }) {
    return (
        <div 
           className={`border p-6 rounded-lg backdrop-blur-sm transition-all hover:scale-105 duration-300 group custom-border`}
           style={{ 
             borderColor: cluster.locked ? "#333" : cluster.color,
             backgroundColor: cluster.locked ? "rgba(0,0,0,0.5)" : `${cluster.color}11`
           }}
        >
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold tracking-widest text-sm" style={{ color: cluster.locked ? "#666" : cluster.color }}>
                   {cluster.label}
               </h3>
               {cluster.locked && <span className="text-[10px] text-zinc-600 border border-zinc-800 px-1 rounded">LOCKED</span>}
            </div>
            
            <p className="text-xs text-white/60 mb-6 h-10 leading-relaxed font-mono">
                {cluster.description}
            </p>

            <ul className="space-y-3">
                {cluster.modules.map(mod => (
                    <li key={mod.id} className="flex items-center gap-2 text-sm group/item cursor-pointer">
                        <div 
                          className={`w-1.5 h-1.5 rounded-full transition-all`} 
                          style={{ backgroundColor: mod.locked ? "#333" : cluster.color }}
                        />
                        <span className={`${mod.locked ? "text-zinc-600" : "text-zinc-300 group-hover/item:text-white transition-colors"}`}>
                           {mod.title}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
