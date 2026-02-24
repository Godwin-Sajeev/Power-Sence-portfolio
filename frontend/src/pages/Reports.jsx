import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Leaf, DollarSign, Zap, TrendingUp, Award, ShieldClose } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
    const [reportData, setReportData] = useState({ topRooms: [], overall: { totalWasted: 0, totalCost: 0 } });

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get('/alerts/stats/weekly');
                setReportData(res.data.data);
            } catch (err) {
                console.error('Error fetching reports:', err);
            }
        };
        fetchReport();
    }, []);

    const environmentalImpact = reportData.overall.totalWasted * 0.4; // 0.4kg CO2 per kWh

    return (
        <div className="reports-page">
            <h1 className="gradient-text">Sustainability & Financial Report</h1>

            <div className="impact-header stats-grid">
                <div className="stat-card glass">
                    <div className="card-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}><Leaf /></div>
                    <div className="card-info">
                        <span className="card-label">Carbon Footprint Saved</span>
                        <h2 className="card-value">0.00 kg</h2>
                        <p className="sub-text">Total Emissions Prevented</p>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="card-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}><TrendingUp /></div>
                    <div className="card-info">
                        <span className="card-label">Total Wasted Energy</span>
                        <h2 className="card-value">{reportData.overall.totalWasted.toFixed(2)} kWh</h2>
                        <p className="sub-text">Detected Post-Hours</p>
                    </div>
                </div>
                <div className="stat-card glass">
                    <div className="card-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-primary)' }}><DollarSign /></div>
                    <div className="card-info">
                        <span className="card-label">Financial Impact</span>
                        <h2 className="card-value">${reportData.overall.totalCost.toFixed(2)}</h2>
                        <p className="sub-text">Estimated Losses</p>
                    </div>
                </div>
            </div>

            <div className="report-sections charts-grid">
                <div className="section-card glass">
                    <div className="section-title">
                        <Award className="icon-gold" />
                        <h3>Top 5 Energy Waste Rooms</h3>
                    </div>
                    <div className="waste-list">
                        {reportData.topRooms.length === 0 && <p className="empty">No waste data recorded.</p>}
                        {reportData.topRooms.map((room, idx) => (
                            <div key={idx} className="waste-item">
                                <div className="rank">#{idx + 1}</div>
                                <div className="room-meta">
                                    <strong>{room.roomDetails.name}</strong>
                                    <p>{room.alertCount} instances detected</p>
                                </div>
                                <div className="wasted-value">
                                    <span>{room.totalWasted.toFixed(2)} kWh</span>
                                    <div className="progress-bar"><div className="fill" style={{ width: `${(room.totalWasted / (reportData.overall.totalWasted || 1)) * 100}%` }}></div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="section-card glass environmental">
                    <div className="section-title">
                        <ShieldClose />
                        <h3>Environmental Footprint Details</h3>
                    </div>
                    <div className="env-stats">
                        <div className="env-stat">
                            <span>CO2 Equivalent</span>
                            <strong>{environmentalImpact.toFixed(2)} kg</strong>
                        </div>
                        <p className="env-desc">
                            Your institution's after-hours energy waste is equivalent to the carbon absorption of
                            <strong> {Math.ceil(environmentalImpact / 20)} </strong> mature trees per year.
                        </p>
                        <div className="trees-grid">
                            {[...Array(Math.min(20, Math.ceil(environmentalImpact / 20)))].map((_, i) => (
                                <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} className="tree">🌲</motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .reports-page { display: flex; flex-direction: column; gap: 32px; }
                .impact-header { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .sub-text { font-size: 0.75rem; color: var(--text-secondary); margin: 4px 0 0 0; }
                
                .section-card { padding: 32px; }
                .section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
                .section-title h3 { margin: 0; font-size: 1.25rem; }
                .icon-gold { color: #fbbf24; }
                
                .waste-list { display: flex; flex-direction: column; gap: 20px; }
                .waste-item { display: flex; align-items: center; gap: 16px; }
                .rank { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; }
                .room-meta { flex: 1; }
                .room-meta p { margin: 2px 0 0 0; font-size: 0.8rem; color: var(--text-secondary); }
                .wasted-value { text-align: right; width: 120px; }
                .wasted-value span { font-weight: 700; font-size: 0.9rem; }
                .progress-bar { height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; margin-top: 6px; overflow: hidden; }
                .progress-bar .fill { height: 100%; background: var(--danger); }

                .environmental .env-stats { display: flex; flex-direction: column; gap: 20px; }
                .env-stat { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; }
                .env-stat strong { color: var(--success); font-size: 1.5rem; }
                .env-desc { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; }
                .trees-grid { display: flex; flex-wrap: wrap; gap: 4px; font-size: 1.5rem; }
                .empty { color: var(--text-secondary); text-align: center; margin-top: 20px; }
            `}</style>
        </div>
    );
};

export default Reports;
