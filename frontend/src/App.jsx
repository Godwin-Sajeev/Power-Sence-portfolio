import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import RoomDetail from './pages/RoomDetail';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Infrastructure from './pages/Infrastructure';
import Setup from './pages/Setup';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Router>
            <div className="min-h-screen bg-background flex flex-col lg:flex-row">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-[60]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Menu className="text-white" size={16} />
                        </div>
                        <h2 className="text-md font-black text-slate-900 tracking-tight uppercase italic">PowerSense</h2>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className={`flex-1 p-6 lg:p-10 overflow-x-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
                    <div className="max-w-7xl mx-auto">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/buildings" element={<Infrastructure />} />
                            <Route path="/room/:id" element={<RoomDetail />} />
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/setup" element={<Setup />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}

export default App;
