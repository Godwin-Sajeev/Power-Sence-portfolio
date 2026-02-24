import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    AlertCircle,
    BarChart3,
    Settings,
    Zap,
    Cpu,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const links = [
        { name: 'Insights', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Infrastructure', path: '/buildings', icon: <Building2 size={18} /> },
        { name: 'Anomalies', path: '/alerts', icon: <AlertCircle size={18} /> },
        { name: 'Impact', path: '/analytics', icon: <BarChart3 size={18} /> },
        { name: 'Terminal', path: '/setup', icon: <Settings size={18} /> },
    ];

    return (
        <div className={`w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(95,111,255,0.3)]">
                        <Zap className="text-white fill-white" size={20} />
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-widest uppercase italic">PowerSense</h2>
                </div>
                <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Operations</p>
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                        }
                    >
                        {link.icon}
                        <span className="font-semibold text-sm tracking-tight">{link.name}</span>
                    </NavLink>
                ))}
            </nav>

        </div>
    );
};

export default Sidebar;
