import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Hash, Search } from 'lucide-react';

const Buildings = () => {
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetch = async () => {
            const bRes = await api.get('/building');
            const rRes = await api.get('/room');
            setBuildings(bRes.data);
            setRooms(rRes.data);
        };
        fetch();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">University Buildings</h1>
                    <p className="text-slate-400 mt-1">Manage and monitor institution infrastructure</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search buildings..."
                        className="bg-white border border-slate-200 pl-10 pr-4 py-2 rounded-lg text-sm text-slate-700 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none w-64 transition-all"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {buildings.map(b => (
                    <div key={b._id} className="glass-panel">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">{b.name}</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Building Code: {b._id.slice(-6)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {rooms.filter(r => r.buildingId?._id === b._id).map(r => (
                                <Link
                                    to={`/room/${r._id}`}
                                    key={r._id}
                                    className="p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:border-blue-500/30 hover:bg-slate-800/60 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{r.name}</h4>
                                        <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 translate-x-0 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Hash size={10} /> Room ID: {r._id.slice(-4)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Buildings;
