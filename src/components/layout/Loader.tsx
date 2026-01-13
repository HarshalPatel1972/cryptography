"use client";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-neon-cyan/50">
      <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin mb-4" />
      <span className="font-mono text-sm tracking-widest uppercase">Initializing Simulation...</span>
    </div>
  );
}
