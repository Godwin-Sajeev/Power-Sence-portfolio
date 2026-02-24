import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socket from '../socket';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    AlertTriangle,
    Zap,
    Activity,
    TrendingUp,
    Clock,
    Layers,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
    const [buildings, setBuildings] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [liveReadings, setLiveReadings] = useState([]);
    const [roomWatts, setRoomWatts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        socket.on('new_alert', (alert) => {
            setAlerts(prev => [alert, ...prev]);
        });

        socket.on('new_reading', (data) => {
            setRoomWatts(prev => ({ ...prev, [data.roomId]: data.watt }));
        });

        const interval = setInterval(() => {
            setRoomWatts(currentWatts => {
                const totalWatt = Object.values(currentWatts).reduce((sum, w) => sum + w, 0);
                setLiveReadings(prev => {
                    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return [...prev, { time: timeStr, watt: totalWatt }].slice(-20);
                });
                return currentWatts;
            });
        }, 4000);

        return () => {
            socket.off('new_alert');
            socket.off('new_reading');
            clearInterval(interval);
        };
    }, []);

    const fetchData = async () => {
        try {
            const bRes = await api.get('/building');
            const aRes = await api.get('/alerts');
            setBuildings(bRes.data);
            setAlerts(aRes.data.filter(a => a.status === 'active'));
        } catch (err) {
            console.error(err);
        }
    };

    const globalLoad = useMemo(() => {
        if (liveReadings.length === 0) return "0.0";
        return (liveReadings[liveReadings.length - 1].watt / 1000).toFixed(2);
    }, [liveReadings]);

    return (
        <div className="space-y-10 pb-20">
            <header className="relative">
                <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full blur-sm"></div>
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                    Live <span className="text-primary">Intelligence</span>
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] lg:text-[10px] mt-2 ml-1">
                    Neural monitoring & energy forensics
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Network nodes', value: buildings.length, icon: Building2, color: 'text-primary', bg: 'bg-primary/5', path: '/buildings' },
                    { label: 'Active Anomalies', value: alerts.length, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/5', path: '/alerts' },
                    { label: 'Real-time Load', value: `${globalLoad} kW`, icon: Zap, color: 'text-warning', bg: 'bg-warning/5', path: '/' },
                    { label: 'System Health', value: '98%', icon: Activity, color: 'text-success', bg: 'bg-success/5', path: '/analytics' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-6 group cursor-pointer"
                        onClick={() => stat.path !== '/' && navigate(stat.path)}
                    >
                        <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-lg`}>
                                <stat.icon size={24} />
                            </div>
                            <ArrowUpRight className="text-slate-700 group-hover:text-primary transition-colors" size={16} />
                        </div>
                        <div className="mt-6">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight italic">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-8">
                <div className="glass-panel p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Stream</span>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-wider flex items-center gap-2">
                            <TrendingUp className="text-primary" size={20} />
                            Global Consumption Flow
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">Real-time watt oscillation across all sectors</p>
                    </div>
                    <div className="h-[350px] w-full min-h-[350px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={liveReadings.length > 0 ? liveReadings : [{ time: '00:00:00', watt: 0 }]}>
                                <defs>
                                    <linearGradient id="colorWatt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="time"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    hide={liveReadings.length < 5}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}W`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="watt"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorWatt)"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {buildings.map((b, i) => (
                        <motion.div
                            key={b._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => navigate('/buildings')}
                            className="glass-panel p-6 border-l-4 border-primary hover:border-white transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                    <Layers size={20} />
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                                    <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Normal</span>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{b.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Sector operational</p>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                            R{j}
                                        </div>
                                    ))}
                                </div>
                                <ChevronRight className="text-slate-700 group-hover:text-slate-900 transition-colors" size={16} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
