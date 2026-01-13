"use client";

import { useState } from "react";
import { Search, Rocket, Code, Shuffle } from "lucide-react";
import { CURRICULUM, Cluster, Module } from "@/lib/constants/curriculum";
import { ModuleCard } from "./ModuleCard";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function CurriculumGrid() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtering Logic
  const filteredClusters = CURRICULUM.map(cluster => {
    const matchesCluster = cluster.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchedModules = cluster.modules.filter(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // If cluster matches, show all modules. If not, only show matched modules.
    if (matchesCluster) return cluster;
    if (matchedModules.length > 0) {
        return { ...cluster, modules: matchedModules };
    }
    return null;
  }).filter(Boolean) as Cluster[];

  const handleModuleClick = (id: string, locked?: boolean) => {
    if (locked) return;
    // Route Mapper
    const routes: Record<string, string> = {
        "xor": "/lessons/primitives/xor",
        "aes": "/lessons/symmetric/aes",
        "dh": "/lessons/asymmetric/dh",
        "sha256": "/lessons/hashing/sha256",
        "dsa": "/lessons/signatures/dsa",
        "ecc": "/lessons/ecc/curves" 
    };
    if (routes[id]) router.push(routes[id]);
  };

  const handleQuickValues = (type: 'start' | 'dev' | 'random') => {
      if (type === 'start') router.push('/lessons/primitives/xor');
      if (type === 'dev') router.push('/lessons/hashing/sha256');
      if (type === 'random') {
          const available = ["xor", "aes", "dh", "sha256", "dsa", "ecc"];
          const random = available[Math.floor(Math.random() * available.length)];
          handleModuleClick(random);
      }
  };

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-xl overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-white mb-2 font-mono">
              CRYPTO-VERSE
            </h1>
            <p className="text-white/50 font-mono text-sm max-w-md">
              The Interactive Encyclopedia of Cryptography.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-white/40 group-focus-within:text-neon-cyan transition-colors" size={20} />
             </div>
             <input 
               type="text" 
               placeholder="Search module (e.g. AES, ECC)..." 
               className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan focus:bg-black/40 transition-all font-mono text-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* QUICK START */}
        {!searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
                <QuickButton 
                    icon={Rocket} 
                    title="Start from Zero" 
                    desc="Begin with Binary & XOR logic."
                    onClick={() => handleQuickValues('start')}
                    color="cyan"
                />
                <QuickButton 
                    icon={Code} 
                    title="Developer Path" 
                    desc="Jump to Hashing & Signatures."
                    onClick={() => handleQuickValues('dev')}
                    color="green"

                />
                <QuickButton 
                    icon={Shuffle} 
                    title="Surprise Me" 
                    desc="Random interactive lesson."
                    onClick={() => handleQuickValues('random')}
                    color="purple"
                />
            </div>
        )}

        {/* CURRICULUM GRID */}
        <div className="space-y-16">
            {filteredClusters.map((cluster) => (
                <section key={cluster.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-2">
                        <div 
                           className="w-3 h-3 rounded-full shadow-[0_0_10px]"
                           style={{ backgroundColor: cluster.color, boxShadow: `0 0 10px ${cluster.color}` }} 
                        />
                        <h2 className="text-2xl font-bold tracking-widest text-white/90">
                            {cluster.label}
                        </h2>
                        {cluster.locked && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/30 border border-white/5">LOCKED</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cluster.modules.map(module => (
                            <ModuleCard 
                                key={module.id} 
                                module={module} 
                                clusterColor={cluster.color}
                                onClick={() => handleModuleClick(module.id, module.locked)}
                            />
                        ))}
                    </div>
                </section>
            ))}

            {filteredClusters.length === 0 && (
                <div className="text-center py-20 text-white/30">
                    No modules found matching "{searchTerm}".
                </div>
            )}
        </div>
        
        {/* FOOTER */}
        <div className="mt-20 pt-10 border-t border-white/5 text-center text-white/20 text-xs font-mono">
            CRYPTO-VERSE ENGINE v1.0 // BUILT WITH NEXT.JS + R3F + RUST
        </div>

      </div>
    </div>
  );
}

function QuickButton({ icon: Icon, title, desc, onClick, color }: any) {
    const colorMap: any = {
        cyan: "hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,243,255,0.2)]",
        green: "hover:border-neon-green hover:shadow-[0_0_20px_rgba(10,255,10,0.2)]",
        purple: "hover:border-neon-purple hover:shadow-[0_0_20px_rgba(188,19,254,0.2)]"
    };

    return (
        <button 
           onClick={onClick}
           className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 group ${colorMap[color]}`}
        >
            <div className={`p-3 rounded-full bg-white/5 mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={24} className="text-white/80" />
            </div>
            <div className="font-bold text-white mb-1">{title}</div>
            <div className="text-xs text-white/40">{desc}</div>
        </button>
    )
}
