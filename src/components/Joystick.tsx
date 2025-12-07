'use client';

import React from 'react';
import {
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight,
    RotateCcw, RotateCw, Octagon
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface JoystickProps {
    onCommand: (cmd: string) => void;
    disabled?: boolean;
}

export default function Joystick({ onCommand, disabled }: JoystickProps) {
    const btnClass = "p-4 rounded-xl bg-white/10 hover:bg-white/20 active:bg-blue-500/50 transition-all flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="flex flex-col items-center gap-6 select-none">
            <div className="grid grid-cols-3 gap-3">
                {/* Row 1 */}
                <button
                    className={btnClass}
                    onClick={() => onCommand('diagonale_avant_gauche')}
                    disabled={disabled}
                    title="Diagonale Avant Gauche"
                >
                    <ArrowUpLeft size={32} />
                </button>
                <button
                    className={twMerge(btnClass, "bg-blue-500/20")}
                    onClick={() => onCommand('avancer')}
                    disabled={disabled}
                    title="Avancer"
                >
                    <ArrowUp size={32} />
                </button>
                <button
                    className={btnClass}
                    onClick={() => onCommand('diagonale_avant_droite')}
                    disabled={disabled}
                    title="Diagonale Avant Droite"
                >
                    <ArrowUpRight size={32} />
                </button>

                {/* Row 2 */}
                <button
                    className={btnClass}
                    onClick={() => onCommand('glisser_gauche')}
                    disabled={disabled}
                    title="Glisser Gauche"
                >
                    <ArrowLeft size={32} />
                </button>
                <button
                    className={twMerge(btnClass, "bg-red-500/20 active:bg-red-600 border-red-500/30")}
                    onClick={() => onCommand('stop')}
                    disabled={disabled}
                    title="STOP"
                >
                    <Octagon size={32} />
                </button>
                <button
                    className={btnClass}
                    onClick={() => onCommand('glisser_droite')}
                    disabled={disabled}
                    title="Glisser Droite"
                >
                    <ArrowRight size={32} />
                </button>

                {/* Row 3 */}
                <button
                    className={btnClass}
                    onClick={() => onCommand('diagonale_arriere_gauche')}
                    disabled={disabled}
                    title="Diagonale Arrière Gauche"
                >
                    <ArrowDownLeft size={32} />
                </button>
                <button
                    className={btnClass}
                    onClick={() => onCommand('reculer')}
                    disabled={disabled}
                    title="Reculer"
                >
                    <ArrowDown size={32} />
                </button>
                <button
                    className={btnClass}
                    onClick={() => onCommand('diagonale_arriere_droite')}
                    disabled={disabled}
                    title="Diagonale Arrière Droite"
                >
                    <ArrowDownRight size={32} />
                </button>
            </div>

            <div className="flex gap-4">
                <button
                    className={twMerge(btnClass, "w-16 h-16 rounded-full")}
                    onClick={() => onCommand('rotation_anti_horaire')}
                    disabled={disabled}
                    title="Rotation Anti-Horaire"
                >
                    <RotateCcw size={24} />
                </button>
                <button
                    className={twMerge(btnClass, "w-16 h-16 rounded-full")}
                    onClick={() => onCommand('rotation_horaire')}
                    disabled={disabled}
                    title="Rotation Horaire"
                >
                    <RotateCw size={24} />
                </button>
            </div>
        </div>
    );
}
