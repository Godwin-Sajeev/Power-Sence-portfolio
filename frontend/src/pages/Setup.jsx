import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Trash2, Home, Building, DoorOpen, Laptop } from 'lucide-react';

const Setup = () => {
    const [institutions, setInstitutions] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [devices, setDevices] = useState([]);
    const [activeTab, setActiveTab] = useState('institution');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const iRes = await api.get('/institution');
        const bRes = await api.get('/building');
        const rRes = await api.get('/room');
        const dRes = await api.get('/device');
        setInstitutions(iRes.data);
        setBuildings(bRes.data);
        setRooms(rRes.data);
        setDevices(dRes.data);
    };

    const [forms, setForms] = useState({
        inst: { name: '' },
        build: { name: '', institutionId: '' },
        room: { name: '', buildingId: '', workingHoursStart: '09:00', workingHoursEnd: '17:00', x: 0, y: 0, width: 150, height: 100 },
        device: { name: '', watt: '', roomId: '' }
    });

    const submit = async (type, data) => {
        await api.post(`/${type}`, data);
        fetchData();
    };

    const deleteItem = async (type, id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await api.delete(`/${type}/${id}`);
            fetchData();
        }
    };

    const tabs = [
        { id: 'institution', name: 'Institutions', icon: <Home size={16} /> },
        { id: 'building', name: 'Buildings', icon: <Building size={16} /> },
        { id: 'room', name: 'Rooms', icon: <DoorOpen size={16} /> },
        { id: 'device', name: 'Devices', icon: <Laptop size={16} /> },
    ];

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">System Configuration</h1>
                <p className="text-slate-500 text-sm mt-1">Setup institution hierarchy and device profiles</p>
            </header>

            <div className="flex flex-wrap gap-2 p-1 bg-white border border-slate-200 rounded-xl w-full lg:w-fit shadow-sm">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all uppercase tracking-widest ${activeTab === t.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                            }`}
                    >
                        {t.icon}
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-8">
                {activeTab === 'institution' && (
                    <div className="space-y-8">
                        <div className="max-w-md">
                            <label className="label-text">Add New Institution</label>
                            <div className="flex gap-4">
                                <input
                                    className="input-field"
                                    placeholder="e.g. Stanford University"
                                    value={forms.inst.name}
                                    onChange={e => setForms({ ...forms, inst: { name: e.target.value } })}
                                />
                                <button onClick={() => submit('institution', forms.inst)} className="btn-primary flex items-center gap-2 shrink-0">
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            {institutions.map(i => (
                                <div key={i._id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="font-bold text-slate-700 uppercase tracking-widest">{i.name}</span>
                                    <button
                                        onClick={() => deleteItem('institution', i._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'building' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label-text">Building Name</label>
                                <input className="input-field" placeholder="e.g. Science Block" onChange={e => setForms({ ...forms, build: { ...forms.build, name: e.target.value } })} />
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        const instId = institutions[0]?._id;
                                        if (!instId) {
                                            alert("Please add an institution first");
                                            return;
                                        }
                                        submit('building', { ...forms.build, institutionId: instId });
                                    }}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Add Building
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mt-8">
                            {buildings.map(b => (
                                <div key={b._id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="font-bold text-slate-700 uppercase tracking-widest">{b.name}</span>
                                    <button
                                        onClick={() => deleteItem('building', b._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'room' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="label-text">Room Name</label>
                                <input className="input-field" onChange={e => setForms({ ...forms, room: { ...forms.room, name: e.target.value } })} />
                            </div>
                            <div>
                                <label className="label-text">Parent Building</label>
                                <select className="input-field" onChange={e => setForms({ ...forms, room: { ...forms.room, buildingId: e.target.value } })}>
                                    <option value="">Select...</option>
                                    {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => submit('room', {
                                        ...forms.room,
                                        mapCoordinates: {
                                            x: forms.room.x,
                                            y: forms.room.y,
                                            width: forms.room.width,
                                            height: forms.room.height
                                        }
                                    })}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} /> Add Room
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                            <div>
                                <label className="label-text">Map X Position</label>
                                <input type="number" className="input-field" value={forms.room.x} onChange={e => setForms({ ...forms, room: { ...forms.room, x: parseInt(e.target.value) } })} />
                            </div>
                            <div>
                                <label className="label-text">Map Y Position</label>
                                <input type="number" className="input-field" value={forms.room.y} onChange={e => setForms({ ...forms, room: { ...forms.room, y: parseInt(e.target.value) } })} />
                            </div>
                            <div>
                                <label className="label-text">Width</label>
                                <input type="number" className="input-field" value={forms.room.width} onChange={e => setForms({ ...forms, room: { ...forms.room, width: parseInt(e.target.value) } })} />
                            </div>
                            <div>
                                <label className="label-text">Height</label>
                                <input type="number" className="input-field" value={forms.room.height} onChange={e => setForms({ ...forms, room: { ...forms.room, height: parseInt(e.target.value) } })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mt-8">
                            {rooms.map(r => (
                                <div key={r._id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="font-bold text-slate-700 uppercase tracking-widest">{r.name}</span>
                                    <button
                                        onClick={() => deleteItem('room', r._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'device' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="label-text">Device Name</label>
                                <input className="input-field" onChange={e => setForms({ ...forms, device: { ...forms.device, name: e.target.value } })} />
                            </div>
                            <div>
                                <label className="label-text">Wattage (W)</label>
                                <input type="number" className="input-field" onChange={e => setForms({ ...forms, device: { ...forms.device, watt: e.target.value } })} />
                            </div>
                            <div>
                                <label className="label-text">Parent Room</label>
                                <select className="input-field" onChange={e => setForms({ ...forms, device: { ...forms.device, roomId: e.target.value } })}>
                                    <option value="">Select...</option>
                                    {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button onClick={() => submit('device', forms.device)} className="btn-primary w-full flex items-center justify-center gap-2">
                                    <Plus size={18} /> Add Device
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs mt-8">
                            {devices.map(d => (
                                <div key={d._id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                                    <div>
                                        <span className="font-bold text-slate-700 uppercase tracking-widest block">{d.name}</span>
                                        <span className="text-slate-400 font-bold">{d.watt}W</span>
                                    </div>
                                    <button
                                        onClick={() => deleteItem('device', d._id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Setup;
