"use client";

import { useLessonStore } from "@/stores/useLessonStore";
import { clsx } from "clsx";
import { Monitor, RefreshCcw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Terminal } from "@/components/dom/Terminal";

interface LessonLayoutProps {
  title: string;
  description: string;
  totalSteps?: number;
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  disableNext?: boolean;
}

export function LessonLayout({
  title,
  description,
  totalSteps = 3,
  children,
  onNext,
  nextLabel = "Next Step",
  disableNext = false,
}: LessonLayoutProps) {
  const { logs, currentStep, nextStep, resetLesson } = useLessonStore();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <main className="relative h-screen w-full bg-void text-neon-cyan overflow-hidden font-mono selection:bg-neon-cyan selection:text-void">
      {/* 3D Canvas Layer (Background) */}
      <div className="absolute inset-0 z-0">{children}</div>

      {/* Top Header / Progress */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <Link href="/" className="text-neon-cyan/50 hover:text-neon-cyan transition-colors text-sm uppercase tracking-widest mb-2 block">
            ← Return to Void
          </Link>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-neon">{title}</h1>
          <p className="max-w-md mt-2 text-neon-cyan/80 text-sm leading-relaxed glass-panel p-4 rounded border border-neon-cyan/20">
            {description}
          </p>
        </div>

        {/* Progress System */}
        <div className="flex gap-2 pointer-events-auto">
           {Array.from({ length: totalSteps }).map((_, i) => (
             <div 
               key={i}
               className={clsx(
                 "w-12 h-2 rounded-full transition-all duration-500",
                 i <= currentStep ? "bg-neon-green shadow-[0_0_10px_#0aff0a]" : "bg-neon-purple/20"
               )}
             />
           ))}
        </div>
      </div>

      {/* Terminal Overlay (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-10 w-96 max-h-64 flex flex-col pointer-events-auto">
        <div className="bg-void/90 border border-neon-purple/30 rounded-t-lg p-2 flex items-center gap-2 text-xs uppercase tracking-wider text-neon-purple">
          <Monitor size={14} />
          <span>System Log</span>
        </div>
        <div className="bg-black/80 backdrop-blur-md border border-t-0 border-neon-purple/30 rounded-b-lg p-4 overflow-y-auto font-mono text-xs h-48 scrollbar-thin scrollbar-thumb-neon-purple/50">
          {logs.length === 0 && (
             <span className="text-gray-600 italic">Listening for events...</span>
          )}
          {logs.map((log, i) => (
            <div key={i} className="mb-1">
              <span className="text-neon-purple mr-2">➜</span>
              <span className="text-white/90">{log}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Controls (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-4 pointer-events-auto">
        <button
          onClick={resetLesson}
          className="flex items-center gap-2 px-6 py-3 border border-neon-cyan/30 bg-black/60 hover:bg-neon-cyan/10 hover:border-neon-cyan text-neon-cyan rounded transition-all uppercase tracking-wider text-sm group"
        >
          <RefreshCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" />
          Reset
        </button>

        <button
          onClick={onNext || nextStep}
          disabled={disableNext}
          className={clsx(
            "flex items-center gap-2 px-8 py-3 rounded transition-all uppercase tracking-wider text-sm font-bold shadow-neon hover:scale-105 active:scale-95",
            disableNext 
              ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed shadow-none" 
              : "bg-neon-cyan text-void hover:bg-white hover:text-black border border-neon-cyan"
          )}
        >
          {nextLabel}
          <ChevronRight size={16} />
        </button>
      </div>

      <Terminal />
    </main>
  );
}
