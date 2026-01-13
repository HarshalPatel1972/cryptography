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
    
    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

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
            className="fixed bottom-0 left-0 w-full h-48 bg-black/80 backdrop-blur-xl border-t border-neon-cyan z-50 font-mono text-neon-green p-4 overflow-hidden shadow-neon-cyan"
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
                    />
                </div>
                <div ref={bottomRef} />
            </div>
            
            {/* Scanlines Overlay - handled by utilities or just pure CSS here */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        </motion.div>
    );
}
