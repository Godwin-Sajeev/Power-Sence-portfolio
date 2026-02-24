import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
    Zap,
    DollarSign,
    Leaf,
    TrendingUp,
    BarChart3,
    Activity,
    Download,
    Calendar,
    ArrowDownRight,
    Search
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

const Analytics = () => {
    const [reports, setReports] = useState([]);
    const [totals, setTotals] = useState({ wasted: 0, cost: 0, carbon: 0 });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/alerts/reports/weekly');
            setReports(res.data.stats || []);
            setTotals(res.data.totals || { wasted: 0, cost: 0, carbon: 0 });
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = () => {
        if (!reports || reports.length === 0) return;

        // CSV Header
        const headers = ["Room", "Wasted Energy (kWh)", "Financial Loss (₹)", "CO2 Footprint (kg)"];

        // CSV Rows
        const rows = reports.map(r => [
            r.room?.name || "Unknown",
            r.totalWasted.toFixed(2),
            r.totalCost.toFixed(2),
            (r.totalWasted * 0.5).toFixed(2) // Approximation for CO2 if not directly in stat
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `powersense_intelligence_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full blur-sm"></div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
                        Impact <span className="text-primary">Forensics</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] lg:text-[10px] mt-2 ml-1">
                        Institutional waste analytics & fiscal leakage
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors">
                        <Calendar size={14} className="text-primary" />
                        Last 7 Days
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn-primary py-2 px-5 text-[10px] tracking-widest"
                    >
                        <Download size={14} />
                        Export Intelligence
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Energy Leak', value: `${totals.wasted.toFixed(1)} kWh`, icon: Zap, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
                    { label: 'Financial Deficit', value: `₹${totals.cost.toFixed(0)}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                    { label: 'CO2 Footprint', value: `${totals.carbon.toFixed(1)} KG`, icon: Leaf, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`glass-panel p-8 relative overflow-hidden group`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`}></div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center border ${stat.border}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h3>
                        <div className="mt-4 flex items-center gap-2">
                            <ArrowDownRight className="text-danger" size={12} />
                            <span className="text-[10px] font-bold text-danger uppercase tracking-tighter">8.2% vs last week</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <section className="lg:col-span-3 glass-panel p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-wider flex items-center gap-2">
                                <BarChart3 className="text-primary" size={20} />
                                Sectoral Waste Distribution
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">Leakage density per operational unit</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors">
                                <Search size={14} />
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full mt-4 min-h-[400px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={reports.length > 0 ? reports : [{ 'room.name': 'N/A', totalWasted: 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="room.name"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#64748b', fontWeight: 'bold' }}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `${val}kW`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                />
                                <Bar
                                    dataKey="totalWasted"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                >
                                    {reports.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                <section className="lg:col-span-2 flex flex-col gap-8">
                    <div className="glass-panel p-8 flex-1">
                        <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-widest mb-8 flex items-center gap-2">
                            <TrendingUp className="text-success" size={16} />
                            Fiscal Leakage Sources
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={reports}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="totalCost"
                                        nameKey="room.name"
                                    >
                                        {reports.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1e293b', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4 mt-6">
                            {reports.slice(0, 3).map((r, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.room?.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900 italic">₹{r.totalCost.toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 bg-primary/5 border border-primary/10 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-slate-900 shrink-0">
                                <Activity size={16} />
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Efficiency Score</h4>
                        </div>
                        <h2 className="text-3xl font-black text-primary italic tracking-tighter">B+</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Average institutional rating</p>
                        <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[75%] rounded-full shadow-[0_0_10px_rgba(95,111,255,0.3)]"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Analytics;
