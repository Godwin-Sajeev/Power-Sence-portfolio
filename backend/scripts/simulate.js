const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Building = require('../models/Building');
const Room = require('../models/Room');
const Device = require('../models/Device');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const runSimulation = async () => {
    try {
        console.log('--- Starting System Setup Simulation ---');

        // 1. Create Building
        const buildingRes = await axios.post(`${API_URL}/buildings`, {
            name: 'Main Campus Block A',
            workingHours: { start: '09:00', end: '17:00' }
        });
        const buildingId = buildingRes.data.data._id;
        console.log('Created Building:', buildingRes.data.data.name);

        // 2. Create Room
        const roomRes = await axios.post(`${API_URL}/rooms`, {
            name: 'Room 101 - IT Lab',
            building: buildingId,
            standbyThreshold: 10
        });
        const roomId = roomRes.data.data._id;
        console.log('Created Room:', roomRes.data.data.name);

        // 3. Create Devices
        const devices = [
            { name: 'LED Bulb A', wattage: 10, room: roomId, usageProbability: 0.8 },
            { name: 'LED Bulb B', wattage: 10, room: roomId, usageProbability: 0.8 },
            { name: 'Ceiling Fan', wattage: 20, room: roomId, usageProbability: 0.3 },
            { name: 'Desktop PC', wattage: 150, room: roomId, usageProbability: 0.1 }
        ];

        for (const device of devices) {
            await axios.post(`${API_URL}/devices`, device);
            console.log('Created Device:', device.name);
        }

        console.log('\n--- Simulating Live Monitoring ---');

        // 4. Simulate Normal Load (During hours)
        // Note: The logic for "after-hours" depends on the current system time.
        // To force an anomaly in the simulation, we might need to adjust the building hours temporarily 
        // OR run this at night. 
        // For the simulation script, let's update building hours to "always closed" temporarily to force detection.

        await axios.put(`${API_URL}/buildings/${buildingId}`, {
            workingHours: { start: '23:59', end: '00:00' } // Always "after hours"
        });
        console.log('Adjusted building hours to force "After-Hours" mode.');

        // 5. Simulate 20W Load (Bulb A + Bulb B OR Fan)
        console.log('\nPosting 20W reading...');
        const readingRes = await axios.post(`${API_URL}/power`, {
            roomId: roomId,
            measuredLoad: 20
        });

        if (readingRes.data.alertTriggered) {
            console.log('✅ ALERT TRIGGERED!');
            console.log('Measured Load:', readingRes.data.alert.measuredLoad, 'W');
            console.log('Suspected Combinations:');
            readingRes.data.alert.possibleCombinations.forEach((c, i) => {
                console.log(`  ${i + 1}. Confidence: ${c.confidence}%`);
            });
        } else {
            console.log('❌ No alert triggered. Check standby threshold or working hours.');
        }

    } catch (err) {
        console.error('Simulation Failed:', err.response?.data || err.message);
    }
};

runSimulation();
