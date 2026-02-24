import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import socket from '../socket';
import { Zap, Clock, ShieldAlert, Cpu, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RoomDetail = () => {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [devices, setDevices] = useState([]);
    const [load, setLoad] = useState(0);
    const [recentReadings, setRecentReadings] = useState([]);
    const [activeAnomaly, setActiveAnomaly] = useState(null);

    useEffect(() => {
        fetchData();

        socket.on('new_reading', (data) => {
            if (data.roomId === id) {
                setLoad(data.watt);
                setRecentReadings(prev => [{ watt: data.watt, timestamp: new Date() }, ...prev].slice(0, 10));
            }
        });

        socket.on('new_alert', (alert) => {
            if (alert.roomId?._id === id) {
                setActiveAnomaly(alert);
            }
        });

        return () => {
            socket.off('new_reading');
            socket.off('new_alert');
        };
    }, [id]);

    const fetchData = async () => {
        try {
            const rRes = await api.get(`/room`);
            const targetRoom = rRes.data.find(r => r._id === id);
            setRoom(targetRoom);

            const dRes = await api.get(`/device/${id}`);
            setDevices(dRes.data);

            const aRes = await api.get('/alerts');
            const roomAlert = aRes.data.find(a => a.roomId?._id === id && a.status === 'active');
            setActiveAnomaly(roomAlert);
        } catch (err) {
            console.error(err);
        }
    };

    if (!room) return <div className="p-8 text-slate-500">Loading room environment...</div>;

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Building: {room.buildingId?.name}</h4>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight uppercase italic">{room.name}</h1>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Managed Hours</p>
                    <div className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-primary font-bold text-sm w-fit md:ml-auto">
                        {room.workingHoursStart} — {room.workingHoursEnd}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass-panel p-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Activity className="text-blue-500" size={20} />
                                Active Power Load
                            </h3>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Threshold: {room.standbyThresholdWatt}W</span>
                        </div>

                        <div className="flex items-baseline gap-4">
                            <h2 className="text-5xl lg:text-7xl font-bold text-slate-900 italic tracking-tighter">{load}</h2>
                            <span className="text-xl lg:text-2xl font-bold text-slate-600 italic">WATTS</span>
                        </div>

                        {/* Visual load bar */}
                        <div className="mt-8 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((load / 500) * 100, 100)}%` }}
                                className={`h-full ${load > room.standbyThresholdWatt ? 'bg-red-500' : 'bg-primary'} shadow-[0_0_20px_rgba(95,111,255,0.3)]`}
                            />
                        </div>
                    </section>

                    <section className="glass-panel">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Cpu className="text-slate-400" size={18} />
                                Registered Devices
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {devices.map(d => (
                                <div key={d._id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-800">{d.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{d.watt}W RATING</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500">
                                        <Zap size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="space-y-8">
                    <AnimatePresence>
                        {activeAnomaly && (
                            <motion.section
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-600 rounded-2xl p-8 border border-red-400/20 shadow-2xl shadow-red-600/20"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <ShieldAlert className="text-slate-900 fill-white/10" size={32} />
                                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">After-Hours Alert</h3>
                                </div>
                                <p className="text-red-100/80 text-sm font-medium leading-relaxed mb-6">
                                    Unexpected load of <b>{activeAnomaly.measuredWatt}W</b> detected outside working hours.
                                </p>

                                <div className="space-y-3">
                                    <p className="text-[10px] text-red-100/50 font-black uppercase tracking-widest">Suspected Devices</p>
                                    {activeAnomaly.suspectedDevices?.map(d => (
                                        <div key={d._id} className="p-3 bg-black/20 rounded-xl border border-white/10 flex items-center justify-between">
                                            <span className="text-sm font-bold text-slate-900">{d.name}</span>
                                            <span className="text-xs font-bold text-red-200">90%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>

                    <section className="glass-panel h-full">
                        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Clock className="text-slate-400" size={18} />
                                Live Feed
                            </h3>
                        </div>
                        <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                            {recentReadings.map((reading, i) => (
                                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                                    <span className="text-slate-400 font-medium">{reading.timestamp.toLocaleTimeString()}</span>
                                    <span className="text-slate-900 font-bold tracking-tighter italic">{reading.watt}W</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
