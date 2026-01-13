"use client";

import { useState, useEffect } from "react";
import { useGameSound } from "@/hooks/useGameSound";
import { motion } from "framer-motion";

// Simple XOR logic
const TARGET_TEXT = "ATTACK AT DAWN";
const SECRET_KEY = 42; // The answer

function encrypt(text: string, key: number) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key);
    }
    return result;
}

export function XorChallenge({ onComplete }: { onComplete: () => void }) {
    const { playClick, playSuccess, playHover } = useGameSound();
    const [key, setKey] = useState(0);
    const [cipherText] = useState(() => encrypt(TARGET_TEXT, SECRET_KEY));
    const [decoded, setDecoded] = useState("");
    const [isSolved, setIsSolved] = useState(false);

    useEffect(() => {
        const result = encrypt(cipherText, key);
        setDecoded(result);
        
        if (result === TARGET_TEXT && !isSolved) {
            setIsSolved(true);
            playSuccess();
            onComplete();
        }
    }, [key, cipherText, isSolved, onComplete, playSuccess]);

    return (
        <div className="bg-black/90 border border-neon-cyan p-6 rounded-lg w-full max-w-md mx-auto pointer-events-auto">
            <h2 className="text-xl text-neon-pink font-bold mb-4 glitch-text">
                CHALLENGE: BREAK THE CIPHER
            </h2>
            
            <div className="mb-4 font-mono text-sm text-gray-400">
                <p>INTERCEPTED MESSAGE:</p>
                <div className="bg-black border border-gray-700 p-2 mt-1 break-all text-neon-cyan">
                    {cipherText.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase()).join(' ')}
                </div>
            </div>

            <div className="mb-6">
                <label className="text-neon-cyan font-mono block mb-2">KEY: {key}</label>
                <input 
                    type="range" 
                    min="0" 
                    max="255" 
                    value={key}
                    onChange={(e) => {
                        setKey(parseInt(e.target.value));
                        // playClick(); // Too frequent
                    }}
                    onPointerUp={() => playClick()}
                    className="w-full range-slider"
                />
            </div>

            <div className="bg-black border border-neon-green p-4 text-center font-mono text-lg">
                <p className="text-gray-500 text-xs mb-1">DECODED OUTPUT</p>
                <p className={isSolved ? "text-neon-green font-bold animate-pulse" : "text-white/60"}>
                    {decoded}
                </p>
            </div>
            
            {isSolved && (
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="mt-4 text-center text-neon-green font-bold text-xl"
                >
                    ACCESS GRANTED
                </motion.div>
            )}
        </div>
    );
}
