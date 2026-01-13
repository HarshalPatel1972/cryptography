"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSound } from "@/hooks/useGameSound";
import { useLessonStore } from "@/stores/useLessonStore";

export function Terminal() {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([
        "CRYPTO-VERSE [Version 1.0.0]",
        "(c) 2026 The Architect. All rights reserved.",
        "",
        "Type 'help' for available commands.",
    ]);
    const { playClick, playSuccess, playFailure } = useGameSound();
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const [isExpanded, setIsExpanded] = useState(false); // Default to minimized
    
    // Auto-scroll
    useEffect(() => {
        if (isExpanded) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [history, isExpanded]);

    const handleCommand = (cmd: string) => {
        const cleanCmd = cmd.trim().toLowerCase();
        let output = "";

        if (cleanCmd === "help") {
            output = "AVAILABLE COMMANDS:\n  help      - Show this list\n  clear     - Clear terminal\n  status    - System status\n  decrypt   - Access challenge tools";
            playSuccess();
        } else if (cleanCmd === "clear") {
            setHistory([]);
            return;
        } else if (cleanCmd === "status") {
            output = "SYSTEM ONLINE.\nINTEGRITY: 100%\nMODULES: ACTIVE";
            playSuccess();
        } else if (cleanCmd.startsWith("decrypt")) {
            output = "Decrypting... ACCESS DENIED (No active challenge locked).";
            playFailure();
            useLessonStore.getState().triggerGlitch();
        } else {
            output = `Command not found: '${cleanCmd}'`;
            playFailure(); // Optional: feedback on typo
        }

        setHistory(prev => [...prev, `> ${cmd}`, output, ""]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            if (input.trim()) {
                playClick();
                handleCommand(input);
                setInput("");
            }
        }
    };

    return (
        <motion.div 
            initial={{ y: 200 }}
            animate={{ y: 0 }}
            className={`fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-neon-cyan z-50 font-mono text-neon-green transition-all duration-300 shadow-neon-cyan ${
                isExpanded ? "h-64" : "h-12 hover:bg-black/90 cursor-pointer"
            }`}
        >
            {/* Header / Toggle Bar */}
            <div 
                className="flex items-center justify-between px-4 h-12 border-b border-neon-cyan/20 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
                    <span className="text-sm font-bold tracking-widest text-white/90">
                        TERMINAL_ACCESS
                    </span>
                </div>
                <div className="text-neon-cyan/50 text-xs">
                    {isExpanded ? "▼ MINIMIZE" : "▲ BLINK_CONN"}
                </div>
            </div>

            {/* Terminal Content (Only visible when expanded) */}
            {isExpanded && (
                <div 
                    className="h-[calc(100%-3rem)] overflow-hidden p-4"
                    onClick={() => inputRef.current?.focus()}
                >
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {history.map((line, i) => (
                            <div key={i} className="whitespace-pre-wrap leading-tight">{line}</div>
                        ))}
                        
                        <div className="flex items-center mt-2 group">
                            <span className="mr-2 text-neon-pink">root@crypto-verse:~#</span>
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-transparent border-none outline-none text-white w-full caret-neon-cyan"
                                autoFocus
                                aria-label="Terminal Command Line Interface"
                            />
                        </div>
                        <div ref={bottomRef} />
                    </div>
                </div>
            )}
            
            {/* Scanlines Overlay - handled by utilities or just pure CSS here */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </motion.div>
    );
}
