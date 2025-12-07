'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';

interface MqttContextType {
    client: MqttClient | null;
    status: 'connected' | 'disconnected' | 'connecting' | 'error';
    lastMessage: { topic: string; payload: string } | null;
    publish: (topic: string, message: string) => void;
    subscribe: (topic: string) => void;
    connect: (brokerUrl: string, options?: any) => void;
    disconnect: () => void;
}

const MqttContext = createContext<MqttContextType>({
    client: null,
    status: 'disconnected',
    lastMessage: null,
    publish: () => { },
    subscribe: () => { },
    connect: () => { },
    disconnect: () => { },
});

export const useMqtt = () => useContext(MqttContext);

export const MqttProvider = ({ children }: { children: ReactNode }) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
    const [lastMessage, setLastMessage] = useState<{ topic: string; payload: string } | null>(null);
    const clientRef = useRef<MqttClient | null>(null);

    const connect = (brokerUrl: string, options?: any) => {
        if (clientRef.current?.connected) return;

        setStatus('connecting');
        const mqttOptions = {
            keepalive: 60,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            ...options,
        };

        const newClient = mqtt.connect(brokerUrl, mqttOptions);
        clientRef.current = newClient;
        setClient(newClient);

        newClient.on('connect', () => {
            console.log('MQTT Connected');
            setStatus('connected');
        });

        newClient.on('error', (err) => {
            console.error('MQTT Error:', err);
            setStatus('error');
        });

        newClient.on('close', () => {
            console.log('MQTT Disconnected');
            setStatus('disconnected');
        });

        newClient.on('message', (topic, message) => {
            setLastMessage({ topic, payload: message.toString() });
        });
    };

    const disconnect = () => {
        if (clientRef.current) {
            clientRef.current.end();
            clientRef.current = null;
            setClient(null);
            setStatus('disconnected');
        }
    };

    const publish = (topic: string, message: string) => {
        if (clientRef.current?.connected) {
            clientRef.current.publish(topic, message);
        } else {
            console.warn('MQTT not connected, cannot publish');
        }
    };

    const subscribe = (topic: string) => {
        if (clientRef.current?.connected) {
            clientRef.current.subscribe(topic);
        }
    };

    return (
        <MqttContext.Provider value={{ client, status, lastMessage, publish, subscribe, connect, disconnect }}>
            {children}
        </MqttContext.Provider>
    );
};
