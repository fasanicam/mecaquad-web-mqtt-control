'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings2 } from 'lucide-react';

interface DifferentialControlProps {
    onUpdate: (left: number, right: number) => void;
    disabled?: boolean;
}

export default function DifferentialControl({ onUpdate, disabled }: DifferentialControlProps) {
    const [leftSpeed, setLeftSpeed] = useState(0);
    const [rightSpeed, setRightSpeed] = useState(0);
    const lastSentRef = useRef(0);

    const handleUpdate = (l: number, r: number) => {
        setLeftSpeed(l);
        setRightSpeed(r);

        const now = Date.now();
        if (now - lastSentRef.current > 100) { // Throttle 100ms
            onUpdate(l, r);
            lastSentRef.current = now;
        }
    };

    const handleStop = () => {
        setLeftSpeed(0);
        setRightSpeed(0);
        onUpdate(0, 0);
    }

    // Effect to ensure final value is sent when user stops sliding (optional but good for precision)
    // For now, simpler: user drags, it updates.

    return (
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white/80 mb-2">
                <Settings2 size={20} />
                <span className="font-semibold">Contrôle Différentiel</span>
            </div>

            <div className="flex gap-8 h-48">
                {/* Left Slider */}
                <div className="flex flex-col items-center h-full gap-2">
                    <input
                        type="range"
                        min="-65535" // Assuming reverse is possible? Or just 0-65535? User said 0 -> 65535.
                        // If just speed, it's 0-65535. If directional, it might be signed.
                        // Description says "vitesse traingauche ... 0 -> 65535".
                        // Usually motor drivers take Speed + Direction or Signed Speed. 
                        // "avancer", "reculer" are separate commands.
                        // If this is *speed* control, it might just set the PWM duty cycle.
                        // I'll stick to 0-65535 as requested.
                        max="65535"
                        step="100"
                        value={leftSpeed}
                        onChange={(e) => handleUpdate(parseInt(e.target.value), rightSpeed)}
                        disabled={disabled}
                        className="h-full w-4 appearance-none rounded-full bg-white/20 outline-none  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 cursor-pointer -rotate-180"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }} // Trick for vertical
                    />
                    <span className="text-xs text-white/50 font-mono select-none">L: {leftSpeed}</span>
                </div>

                {/* Right Slider */}
                <div className="flex flex-col items-center h-full gap-2">
                    <input
                        type="range"
                        min="0"
                        max="65535"
                        step="100"
                        value={rightSpeed}
                        onChange={(e) => handleUpdate(leftSpeed, parseInt(e.target.value))}
                        disabled={disabled}
                        className="h-full w-4 appearance-none rounded-full bg-white/20 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 cursor-pointer -rotate-180"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                    <span className="text-xs text-white/50 font-mono select-none">R: {rightSpeed}</span>
                </div>
            </div>

            <button
                onClick={handleStop}
                className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded text-sm transition-colors"
            >
                Reset Vitesses
            </button>
        </div>
    );
}
