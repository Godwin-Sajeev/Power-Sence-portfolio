const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');
const Device = require('./models/Device');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('Simulator Connected to Database'))
    .catch(err => { console.error(err); process.exit(1); });

const API_URL = 'http://localhost:5001/api/reading';

// Function to calculate a random power usage for a room based on its devices
const calculateRoomLoad = (devices) => {
    let currentWattage = 0;
    devices.forEach(device => {
        // Random chance this device is currently ON
        // For computers, maybe 80% chance they are ON during the simulation
        // For fans/lights, maybe 50% chance
        const isOn = Math.random() > 0.4;

        if (isOn) {
            // Add some realistic fluctuation (+/- 10%)
            const fluctuation = device.watt * 0.1;
            const actualWatt = device.watt + (Math.random() * fluctuation * 2 - fluctuation);
            currentWattage += actualWatt;
        }
    });

    // Add a baseline idle power for the room (just cables, monitors on standby, etc)
    return Math.max(0, currentWattage + 15);
};

// Main simulation loop
const simulateActivity = async () => {
    try {
        const rooms = await Room.find();
        if (rooms.length === 0) {
            console.log("No rooms found to simulate.");
            return;
        }

        console.log(`Starting simulation for ${rooms.length} rooms...`);

        // Send a reading for every room every 3 seconds
        setInterval(async () => {
            for (const room of rooms) {
                // Get devices for this room to calculate realistic load
                const devices = await Device.find({ roomId: room._id });

                let simulatedLoad = 0;
                let isAnomaly = false;

                if (room.name === 'CCF Lab') {
                    // Force Priority Alert
                    simulatedLoad = calculateRoomLoad(devices) + 3000;
                    isAnomaly = true;
                    console.log(`🚨 Generating Anomaly Spike in ${room.name}!`);
                } else if (room.name === 'Class 1' || room.name === 'Class 2' || room.name === 'Library') {
                    // Force Operational (Normal Working Load)
                    simulatedLoad = calculateRoomLoad(devices);
                } else {
                    // Force Standby / Idle (Everything off, just phantom drain)
                    simulatedLoad = Math.random() * 5;
                }

                try {
                    await axios.post(API_URL, {
                        roomId: room._id,
                        watt: Math.round(simulatedLoad)
                    });
                } catch (err) {
                    console.error(`Failed to send reading for ${room.name}:`, err.message);
                }
            }
            console.log(`[${new Date().toLocaleTimeString()}] Sent power frame for college...`);
        }, 4000); // 4 seconds interval
    } catch (err) {
        console.error("Simulation error:", err);
    }
};

setTimeout(simulateActivity, 2000);
