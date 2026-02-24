import React, { useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../socket';
import { ShieldAlert, CheckCircle, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        fetchAlerts();
        socket.on('new_alert', (alert) => {
            setAlerts(prev => [alert, ...prev]);
        });
        return () => socket.off('new_alert');
    }, []);

    const fetchAlerts = async () => {
        const res = await api.get('/alerts');
        setAlerts(res.data);
    };

    const resolveAlert = async (id) => {
        try {
            await api.patch(`/alerts/${id}`, { status: 'resolved' });
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, status: 'resolved' } : a));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight uppercase italic">Financial & Ecological Reports</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Institutional waste analytics and impact assessment</p>
            </header>

            <div className="space-y-4">
                <AnimatePresence>
                    {alerts.map((a) => (
                        <motion.div
                            key={a._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass-panel border-l-4 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${a.status === 'active' ? 'border-red-500' : 'border-green-500/50 grayscale opacity-75'
                                }`}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${a.status === 'active' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                                    }`}>
                                    {a.status === 'active' ? <ShieldAlert size={28} /> : <ShieldCheck size={28} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{a.roomId?.name}</h3>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${a.status === 'active' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'
                                            }`}>
                                            {a.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(a.createdAt).toLocaleString()}</span>
                                        <span className="text-red-400/80 tracking-tighter italic font-black text-sm">{a.measuredWatt}W INCIDENT</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Matching Profiles</p>
                                    <div className="flex flex-wrap gap-2">
                                        {a.suspectedDevices?.map(d => (
                                            <span key={d._id} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                                                {d.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {a.status === 'active' && (
                                    <button
                                        onClick={() => resolveAlert(a._id)}
                                        className="btn-primary bg-green-600 hover:bg-green-500 shadow-green-600/20 px-6 py-3 h-fit flex items-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        <span>Resolve</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Alerts;
