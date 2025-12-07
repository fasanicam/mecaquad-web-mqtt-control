'use client';



import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ConfigPage() {
    const [nomVoiture, setNomVoiture] = useState('');
    const [brokerUrl, setBrokerUrl] = useState('');
    const router = useRouter();

    useEffect(() => {
        const savedName = localStorage.getItem('nomVoiture');
        const savedUrl = localStorage.getItem('brokerUrl');

        if (savedName) setNomVoiture(savedName);
        // Default to ICAM broker
        setBrokerUrl(savedUrl || 'wss://mqtt.dev.icam.school/mqtt');
        // Note: 1883 is TCP, usually 9001/8083 is WS. 
        // If the user insists on 1883, they can type it, but it likely won't work in browser.
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (nomVoiture.trim()) {
            localStorage.setItem('nomVoiture', nomVoiture.trim());
            localStorage.setItem('brokerUrl', brokerUrl.trim() || 'wss://mqtt.dev.icam.school:443/mqtt');
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Configuration
                    </h1>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-6">

                    {/* Nom de la Voiture */}
                    <div>
                        <label htmlFor="nomVoiture" className="block text-sm font-medium text-white/70 mb-2">
                            Nom de la Voiture
                        </label>
                        <input
                            id="nomVoiture"
                            type="text"
                            value={nomVoiture}
                            onChange={(e) => setNomVoiture(e.target.value)}
                            placeholder="ex: robot-01"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            required
                        />
                        <div className="mt-2 text-xs text-white/40">
                            Topic : <code className="text-blue-300">bzh/iot/voiture/[nomVoiture]/...</code>
                        </div>
                    </div>

                    {/* Broker URL */}
                    <div>
                        <label htmlFor="brokerUrl" className="block text-sm font-medium text-white/70 mb-2">
                            URL du Broker MQTT (WSS)
                        </label>
                        <input
                            id="brokerUrl"
                            type="text"
                            value={brokerUrl}
                            onChange={(e) => setBrokerUrl(e.target.value)}
                            placeholder="wss://mqtt.dev.icam.school/mqtt"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                        />
                        <div className="mt-2 text-xs text-white/40">
                            Défaut: <code className="text-blue-300">wss://mqtt.dev.icam.school/mqtt</code>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                setBrokerUrl('wss://mqtt.dev.icam.school:443/mqtt');
                                setNomVoiture('');
                                localStorage.removeItem('brokerUrl');
                                localStorage.removeItem('nomVoiture');
                            }}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/25"
                        >
                            <Save size={20} />
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
