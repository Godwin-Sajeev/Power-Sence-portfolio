import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';

const MapView = () => {
    const [buildings, setBuildings] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState(null);
    const [buildingRooms, setBuildingRooms] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const bRes = await api.get('/buildings');
                const aRes = await api.get('/alerts');
                setBuildings(bRes.data.data);
                setAlerts(aRes.data.data.filter(a => !a.isResolved));
            } catch (err) {
                console.error('Error fetching map data:', err);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000); // Polling every 10s
        return () => clearInterval(interval);
    }, []);

    const getBuildingStatus = (buildingId) => {
        const activeBuildingAlerts = alerts.filter(a => a.room?.building === buildingId);
        if (activeBuildingAlerts.length > 0) {
            const highConfidence = activeBuildingAlerts.some(a => a.possibleCombinations[0]?.confidence > 70);
            return highConfidence ? 'red' : 'yellow';
        }
        return 'green';
    };

    const handleBuildingClick = async (building) => {
        setSelectedBuilding(building);
        try {
            const rRes = await api.get(`/rooms?building=${building._id}`);
            setBuildingRooms(rRes.data.data);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        }
    };

    return (
        <div className="map-view">
            <h1 className="gradient-text">Institution Energy Map</h1>

            <div className="map-container glass">
                <div className="map-svg-wrapper">
                    <svg viewBox="0 0 800 500" className="campus-map">
                        {/* Define some building "lots" */}
                        {buildings.map((b, i) => {
                            const status = getBuildingStatus(b._id);
                            const x = 100 + (i % 3) * 250;
                            const y = 80 + Math.floor(i / 3) * 180;

                            return (
                                <g
                                    key={b._id}
                                    className={`building-node ${status}`}
                                    onClick={() => handleBuildingClick(b)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <motion.rect
                                        x={x} y={y} width="160" height="120" rx="12"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                                        transition={{ delay: i * 0.1 }}
                                        fill={status === 'red' ? 'rgba(239, 68, 68, 0.2)' : status === 'yellow' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)'}
                                        stroke={status === 'red' ? 'var(--danger)' : status === 'yellow' ? 'var(--warning)' : 'var(--success)'}
                                        strokeWidth="2"
                                    />
                                    <text x={x + 80} y={y + 65} textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="600">{b.name}</text>
                                    <circle cx={x + 140} cy={y + 20} r="6" fill={status === 'red' ? 'var(--danger)' : status === 'yellow' ? 'var(--warning)' : 'var(--success)'} className="status-pulse" />
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="map-legend">
                    <div className="legend-item"><span className="dot green"></span> Normal</div>
                    <div className="legend-item"><span className="dot yellow"></span> Moderate Load</div>
                    <div className="legend-item"><span className="dot red"></span> After-Hours Anomaly</div>
                </div>
            </div>

            <AnimatePresence>
                {selectedBuilding && (
                    <motion.div
                        className="building-sidebar glass"
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                    >
                        <div className="sidebar-header">
                            <h2>{selectedBuilding.name}</h2>
                            <button onClick={() => setSelectedBuilding(null)}><X /></button>
                        </div>

                        <div className="rooms-list">
                            <h3>Rooms Status</h3>
                            {buildingRooms.length === 0 && <p className="empty-text">No rooms registered.</p>}
                            {buildingRooms.map(room => {
                                const roomAlert = alerts.find(a => a.room?._id === room._id);
                                return (
                                    <div key={room._id} className={`room-card ${roomAlert ? 'alert' : ''}`}>
                                        <div className="room-info">
                                            <h4>{room.name}</h4>
                                            <p>{roomAlert ? `Anomalous Load: ${roomAlert.measuredLoad}W` : 'Status: Normal'}</p>
                                        </div>
                                        {roomAlert ? <ShieldAlert className="alert-icon" /> : <CheckCircle2 className="success-icon" />}

                                        {roomAlert && (
                                            <div className="anomaly-details">
                                                <p className="suspect-title">Suspected Devices:</p>
                                                {roomAlert.possibleCombinations[0]?.devices.map(d => (
                                                    <span key={d._id} className="device-tag">{d.name} ({roomAlert.possibleCombinations[0].confidence}%)</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .map-view { position: relative; height: 100%; overflow: hidden; }
                .map-container { margin-top: 24px; padding: 20px; overflow: hidden; position: relative; }
                .map-svg-wrapper { display: flex; justify-content: center; align-items: center; }
                .campus-map { width: 100%; height: auto; max-height: 600px; }
                
                .status-pulse {
                    filter: blur(2px);
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.5); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .map-legend {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                    display: flex;
                    gap: 20px;
                }
                .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
                .dot { width: 10px; height: 10px; border-radius: 50%; }
                .dot.green { background: var(--success); box-shadow: 0 0 10px var(--success); }
                .dot.yellow { background: var(--warning); box-shadow: 0 0 10px var(--warning); }
                .dot.red { background: var(--danger); box-shadow: 0 0 10px var(--danger); }

                .building-sidebar {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 380px;
                    height: 100%;
                    padding: 30px;
                    z-index: 10;
                    border-radius: 16px 0 0 16px;
                }
                .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .rooms-list h3 { margin-bottom: 20px; font-size: 1.2rem; }
                .room-card {
                    padding: 16px;
                    background: #ffffff;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid var(--border-color);
                }
                .room-card.alert { border-color: rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.05); }
                .alert-icon { color: var(--danger); }
                .success-icon { color: var(--success); }
                .anomaly-details { width: 100%; margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--border-color); }
                .suspect-title { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px; }
                .device-tag {
                    display: inline-block;
                    padding: 4px 10px;
                    background: #f1f5f9;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    margin-right: 6px;
                    margin-bottom: 6px;
                }
                .empty-text { color: var(--text-secondary); text-align: center; margin-top: 40px; }
            `}</style>
        </div>
    );
};

export default MapView;
