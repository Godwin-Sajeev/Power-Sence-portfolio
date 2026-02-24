import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Activity, AlertTriangle, Zap, Info, ChevronRight, Maximize2 } from 'lucide-react';
import api from '../services/api';
import socket from '../socket';

const Infrastructure = () => {
    const [buildings, setBuildings] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [liveData, setLiveData] = useState({}); // { roomId: watt }
    const [alerts, setAlerts] = useState([]);
    const [hoveredRoom, setHoveredRoom] = useState(null);

    useEffect(() => {
        fetchInitialData();

        socket.on('new_reading', (data) => {
            setLiveData(prev => ({ ...prev, [data.roomId]: data.watt }));
        });

        socket.on('new_alert', (alert) => {
            setAlerts(prev => [alert, ...prev]);
        });

        return () => {
            socket.off('new_reading');
            socket.off('new_alert');
        };
    }, []);

    const fetchInitialData = async () => {
        try {
            const bRes = await api.get('/building');
            const buildingsData = bRes.data;
            setBuildings(buildingsData);
            if (buildingsData.length > 0) {
                setSelectedBuilding(buildingsData[0]);
                fetchRooms(buildingsData[0]._id);
            }

            const readRes = await api.get('/reading');
            const initialLiveData = {};
            readRes.data.forEach(r => {
                const rId = typeof r.roomId === 'object' ? r.roomId._id : r.roomId;
                if (initialLiveData[rId] === undefined) {
                    initialLiveData[rId] = r.watt;
                }
            });
            setLiveData(initialLiveData);
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };

    const fetchRooms = async (buildingId) => {
        try {
            const rRes = await api.get(`/room?buildingId=${buildingId}`);
            setRooms(rRes.data);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        }
    };

    const getRoomStatus = (room) => {
        const watt = liveData[room._id] || 0;
        const hasAlert = alerts.some(a => a.roomId?._id === room._id || a.roomId === room._id);

        if (hasAlert) return 'danger';
        if (watt > room.standbyThresholdWatt) return 'active';
        return 'standby';
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-2"
                    >
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary border border-primary/30">
                            <Layers size={16} />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Spatial Intelligence</span>
                    </motion.div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter italic">
                        INFRASTRUCTURE <span className="text-primary">MAP</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="bg-white border border-slate-200 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl focus:outline-none focus:border-primary transition-colors min-w-[200px]"
                        value={selectedBuilding?._id || ''}
                        onChange={(e) => {
                            const b = buildings.find(b => b._id === e.target.value);
                            setSelectedBuilding(b);
                            if (b) fetchRooms(b._id);
                        }}
                    >
                        <option value="" disabled>{buildings.length === 0 ? 'No Buildings Found' : 'Select Building...'}</option>
                        {buildings.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Map View */}
                <div className="lg:col-span-3">
                    <div className="glass-panel aspect-video relative overflow-hidden group">
                        <div className="absolute top-6 left-6 z-10">
                            <h2 className="text-sm font-black text-slate-900 uppercase italic tracking-widest flex items-center gap-2">
                                <Maximize2 className="text-primary" size={16} />
                                Floor Plan Alpha
                            </h2>
                        </div>

                        {/* Embedded Legend inside the Map */}
                        <div className="absolute top-6 right-6 z-10 glass-panel border-white/20 p-4 w-56 shadow-2xl bg-white/40 backdrop-blur-xl rounded-2xl">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase italic tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Zap className="text-primary" size={12} />
                                Legend
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Standby / Idle', status: 'standby' },
                                    { label: 'Operational', status: 'active' },
                                    { label: 'Priority Alert', status: 'danger' }
                                ].map((item) => (
                                    <div key={item.status} className="flex gap-3 items-center">
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.status === 'standby' ? 'bg-slate-400' :
                                            item.status === 'active' ? 'bg-primary shadow-[0_0_8px_#6366f1]' :
                                                'bg-danger shadow-[0_0_8px_#ef4444]'
                                            }`} />
                                        <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-tight">{item.label}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SVG Drawing Area */}
                        <div className="w-full h-full flex items-center justify-center p-4 lg:p-12">
                            <svg
                                viewBox="0 0 1000 800"
                                className="w-full h-full drop-shadow-2xl"
                                style={{ filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.1))' }}
                            >
                                <defs>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Grid Background */}
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                </pattern>
                                <rect width="1000" height="800" fill="url(#grid)" />

                                {rooms.map((room) => {
                                    const coords = room.mapCoordinates || { x: 0, y: 0, width: 100, height: 100 };
                                    const status = getRoomStatus(room);

                                    const colors = {
                                        standby: 'rgba(71, 85, 105, 0.2)',
                                        active: 'rgba(99, 102, 241, 0.3)',
                                        danger: 'rgba(239, 68, 68, 0.4)'
                                    };

                                    const borderColors = {
                                        standby: 'rgba(71, 85, 105, 0.5)',
                                        active: '#6366f1',
                                        danger: '#ef4444'
                                    };

                                    return (
                                        <motion.g
                                            key={room._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onHoverStart={() => setHoveredRoom(room)}
                                            onHoverEnd={() => setHoveredRoom(null)}
                                            className="cursor-pointer"
                                        >
                                            <rect
                                                x={coords.x}
                                                y={coords.y}
                                                width={coords.width}
                                                height={coords.height}
                                                rx="12"
                                                fill={colors[status]}
                                                stroke={borderColors[status]}
                                                strokeWidth={status === 'standby' ? 1 : 2}
                                                className="transition-all duration-500"
                                                style={{ filter: status !== 'standby' ? 'url(#glow)' : 'none' }}
                                            />
                                            {/* Labels */}
                                            <text
                                                x={coords.x + 20}
                                                y={coords.y + 40}
                                                fill="#1e293b"
                                                className="text-[14px] font-black uppercase tracking-tighter"
                                                style={{ opacity: 0.8 }}
                                            >
                                                {room.name}
                                            </text>
                                            <text
                                                x={coords.x + 20}
                                                y={coords.y + 65}
                                                fill={borderColors[status]}
                                                className="text-[12px] font-bold"
                                            >
                                                {liveData[room._id] || 0}W
                                            </text>
                                            <text
                                                x={coords.x + 20}
                                                y={coords.y + 85}
                                                fill={borderColors[status]}
                                                className="text-[9px] font-black uppercase tracking-widest"
                                            >
                                                {status === 'active' ? 'OPERATIONAL' : status === 'danger' ? 'PRIORITY ALERT' : 'STANDBY / IDLE'}
                                            </text>
                                        </motion.g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Tooltip Overlay */}
                        <AnimatePresence>
                            {hoveredRoom && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-8 left-8 p-4 glass-panel border-primary/50 w-64 pointer-events-none"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <Info size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-slate-900 uppercase">{hoveredRoom.name}</h4>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">{selectedBuilding?.name}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Current Load</span>
                                            <span className="text-xs font-black text-slate-900 italic">{liveData[hoveredRoom._id] || 0}W</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                                            <span className={`text-[10px] font-black uppercase italic ${getRoomStatus(hoveredRoom) === 'danger' ? 'text-danger' : 'text-primary'}`}>
                                                {getRoomStatus(hoveredRoom)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">


                    <div className="glass-panel p-6 overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-xs font-black text-slate-900 uppercase italic tracking-[0.2em] mb-4">Spatial Metrics</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                        <span>Area Coverage</span>
                                        <span>78%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[78%] shadow-[0_0_10px_#6366f1]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                                        <span>Engine Integrity</span>
                                        <span>99.9%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[99.9%] shadow-[0_0_10px_#22c55e]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Activity className="absolute -bottom-4 -right-4 text-white/5 w-24 h-24" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Infrastructure;
