'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, AlertTriangle, PlayCircle } from 'lucide-react';
import { MqttProvider, useMqtt } from '@/lib/mqttContext';
import Joystick from '@/components/Joystick';

import Telemetry from '@/components/Telemetry';
import TrafficLogger, { LogMessage } from '@/components/TrafficLogger';
import { Edit2 } from 'lucide-react'; // Add Edit2 import

// Main Dashboard Component (Inner)
function Dashboard() {
  const { connect, subscribe, publish, lastMessage, status } = useMqtt();
  const [nomVoiture, setNomVoiture] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | string>('--');
  const [vehicleStatus, setVehicleStatus] = useState<string>('Offline');
  const [lastCmd, setLastCmd] = useState<string>('');
  const [logs, setLogs] = useState<LogMessage[]>([]); // Logger state
  const router = useRouter();

  // Load Config & Connect
  useEffect(() => {
    const savedName = localStorage.getItem('nomVoiture');
    if (!savedName) {
      router.push('/config');
      return;
    }
    setNomVoiture(savedName);

    // Order: LocalStorage > Env > Default (School)
    let storedBroker = localStorage.getItem('brokerUrl');

    // Auto-fix: Correct port 433 to 443 if present
    if (storedBroker && storedBroker.includes(':433/')) {
      storedBroker = storedBroker.replace(':433/', ':443/');
      localStorage.setItem('brokerUrl', storedBroker);
    }

    const brokerUrl = storedBroker || process.env.NEXT_PUBLIC_MQTT_URL || 'wss://mqtt.dev.icam.school/mqtt';

    const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
    const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

    connect(brokerUrl, {
      username,
      password,
      clientId: `webapp_ctrl_${Math.random().toString(16).substring(2, 8)}`,
    });
  }, [connect, router]);

  // Subscribe once connected
  useEffect(() => {
    if (status === 'connected' && nomVoiture) {
      subscribe(`bzh/iot/voiture/${nomVoiture}/distance`);
      subscribe(`bzh/iot/voiture/${nomVoiture}/status`);
      // Optional: Subscribe to all voiture traffic for debugging (careful with volume)
      // subscribe(`bzh/iot/voiture/${nomVoiture}/#`);
    }
  }, [status, nomVoiture, subscribe]);

  // Handle Income Messages
  useEffect(() => {
    if (lastMessage && nomVoiture) {
      const topic = lastMessage.topic;
      const payload = lastMessage.payload;

      if (topic.endsWith('/distance')) {
        setDistance(payload);
      } else if (topic.endsWith('/status')) {
        setVehicleStatus(payload);
      }

      // Update Logs
      setLogs(prev => [
        ...prev.slice(-49), // Keep last 50
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          topic: topic,
          payload: payload.toString(),
          direction: 'RX'
        }
      ]);
    }
  }, [lastMessage, nomVoiture]);

  // Command handlers
  const sendCommand = (cmd: string) => {
    if (!nomVoiture) return;
    const topic = `bzh/iot/voiture/${nomVoiture}/cmd`;
    publish(topic, cmd);
    setLastCmd(cmd);

    // Quick local feedback (optional)
    // Audio or visual check could be added here
    // Log TX
    setLogs(prev => [
      ...prev.slice(-49),
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        topic: topic,
        payload: cmd,
        direction: 'TX'
      }
    ]);
  };



  if (!nomVoiture) return <div className="text-white text-center mt-20">Chargement configuration...</div>;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <PlayCircle className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              MecaQuad Control
            </h1>
            <p className="text-xs text-white/50 font-mono flex items-center gap-2">
              {nomVoiture}
              <Link href="/config" className="hover:text-white transition-colors">
                <Edit2 size={12} />
              </Link>
            </p>
          </div>
        </div>

        <Link
          href="/config"
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
          title="Configuration"
        >

        </Link>
      </header>

      {/* Telemetry Bar */}
      <Telemetry
        distance={distance}
        vehicleStatus={vehicleStatus}
        mqttStatus={status}
        lastCommand={lastCmd}
      />

      {/* Main Control Area */}
      <div className="flex flex-col gap-6">

        {/* Joystick Section */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center">
          <h2 className="text-white/50 uppercase tracking-widest text-sm mb-6 w-full text-center">Directionnel</h2>
          <Joystick onCommand={sendCommand} disabled={status !== 'connected'} />
        </div>

        {/* Traffic Logger Section */}
        <div className="flex flex-col">
          <TrafficLogger logs={logs} onClear={() => setLogs([])} />
        </div>



        {/* Emergency Stop (Big Footer Button for quick access? Or stuck to Joystick? Joystick has STOP) */}
        {/* User asked for "bouton STOP d’urgence (rouge)". Joystick has it. Maybe a big FAB or bottom bar? */}
        {/* Let's double down on safety. */}
        <button
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/50 text-white font-bold text-xl uppercase tracking-widest flex items-center justify-center gap-3 transition-transform active:scale-95"
          onClick={() => sendCommand('stop')}
        >
          <AlertTriangle />
          STOP D'URGENCE
        </button>
      </div>
    </div>
  );
}

// Wrapper to provide Context
export default function Page() {
  return (
    <MqttProvider>
      <Dashboard />
    </MqttProvider>
  );
}
