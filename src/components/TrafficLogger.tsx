'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Trash2, ArrowDown, ArrowUp } from 'lucide-react';

export interface LogMessage {
    id: number;
    timestamp: string;
    topic: string;
    payload: string;
    direction: 'RX' | 'TX';
}

interface TrafficLoggerProps {
    logs: LogMessage[];
    onClear: () => void;
}

export default function TrafficLogger({ logs, onClear }: TrafficLoggerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new log
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-panel p-6 rounded-3xl flex flex-col h-[400px] w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white/80">
                    <Terminal size={20} />
                    <span className="font-semibold">Mouchard MQTT</span>
                </div>
                <button
                    onClick={onClear}
                    className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-red-400 transition-colors"
                    title="Effacer les logs"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-black/30 rounded-xl p-4 font-mono text-xs border border-white/5 space-y-2 no-scrollbar"
            >
                {logs.length === 0 && (
                    <div className="text-white/30 text-center italic mt-10">Aucun message...</div>
                )}

                {logs.map((msg) => (
                    <div key={msg.id} className="flex gap-3 hover:bg-white/5 p-1.5 rounded transition-colors group">
                        <div className="text-white/30 shrink-0 select-none w-16">{msg.timestamp}</div>

                        <div className={`shrink-0 flex items-center justify-center w-6 h-6 rounded ${msg.direction === 'TX' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                            {msg.direction === 'TX' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-white/60 truncate font-semibold" title={msg.topic}>
                                {msg.topic}
                            </span>
                            <span className="text-white/90 break-all">
                                {msg.payload}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
