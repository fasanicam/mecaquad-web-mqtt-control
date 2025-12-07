'use client';

import React from 'react';
import { Wifi, WifiOff, Activity, Ruler, Terminal } from 'lucide-react';
import { clsx } from 'clsx';

interface TelemetryProps {
    distance: number | string;
    vehicleStatus: string;
    mqttStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
    lastCommand: string;
}

export default function Telemetry({ distance, vehicleStatus, mqttStatus, lastCommand }: TelemetryProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {/* MQTT Status */}
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className={clsx("p-2 rounded-full", {
                    "bg-green-500/20 text-green-400": mqttStatus === 'connected',
                    "bg-red-500/20 text-red-400": mqttStatus === 'disconnected' || mqttStatus === 'error',
                    "bg-yellow-500/20 text-yellow-400": mqttStatus === 'connecting'
                })}>
                    {mqttStatus === 'connected' ? <Wifi size={24} /> : <WifiOff size={24} />}
                </div>
                <div className="text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wider">MQTT</p>
                    <p className="font-semibold text-white capitalize">{mqttStatus}</p>
                </div>
            </div>

            {/* Distance */}
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                    <Ruler size={24} />
                </div>
                <div className="text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wider">Distance</p>
                    <p className="font-semibold text-white text-xl">{distance} <span className="text-sm text-white/60">cm</span></p>
                </div>
            </div>

            {/* Vehicle Status */}
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
                    <Activity size={24} />
                </div>
                <div className="text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wider">État Robot</p>
                    <p className="font-semibold text-white truncate max-w-[100px]" title={vehicleStatus}>{vehicleStatus || 'N/A'}</p>
                </div>
            </div>

            {/* Last Command */}
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center gap-2">
                <div className="p-2 rounded-full bg-orange-500/20 text-orange-400">
                    <Terminal size={24} />
                </div>
                <div className="text-center">
                    <p className="text-xs text-white/50 uppercase tracking-wider">Dern. Cmd</p>
                    <p className="font-mono text-xs text-white/80 mt-1 truncate max-w-[120px]" title={lastCommand}>{lastCommand || '-'}</p>
                </div>
            </div>
        </div>
    );
}
