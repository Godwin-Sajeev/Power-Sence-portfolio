const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Institution = require('../models/Institution');
const Building = require('../models/Building');
const Room = require('../models/Room');
const Device = require('../models/Device');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing
        await Institution.deleteMany();
        await Building.deleteMany();
        await Room.deleteMany();
        await Device.deleteMany();

        const inst = await Institution.create({ name: 'Oxford Institute of Technology' });

        const b1 = await Building.create({ name: 'Science Block A', institutionId: inst._id });
        const b2 = await Building.create({ name: 'Admin Complex', institutionId: inst._id });

        const r1 = await Room.create({
            name: 'Lab 101',
            buildingId: b1._id,
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            standbyThresholdWatt: 10,
            mapCoordinates: { x: 100, y: 100, width: 300, height: 200 }
        });

        const r2 = await Room.create({
            name: 'Faculty Room',
            buildingId: b1._id,
            workingHoursStart: '08:00',
            workingHoursEnd: '18:00',
            standbyThresholdWatt: 5,
            mapCoordinates: { x: 450, y: 100, width: 250, height: 200 }
        });

        const r3 = await Room.create({
            name: 'Server Room',
            buildingId: b1._id,
            workingHoursStart: '00:00',
            workingHoursEnd: '00:00', // Always working
            standbyThresholdWatt: 50,
            mapCoordinates: { x: 100, y: 350, width: 200, height: 300 }
        });

        const devices = [
            { name: 'PC Tower', watt: 150, roomId: r1._id, usageProbability: 0.8 },
            { name: 'Monitor', watt: 30, roomId: r1._id, usageProbability: 0.8 },
            { name: 'LED Bulb', watt: 12, roomId: r1._id, usageProbability: 0.9 },
            { name: 'Ceiling Fan', watt: 60, roomId: r2._id, usageProbability: 0.5 },
            { name: 'Coffee Machine', watt: 800, roomId: r2._id, usageProbability: 0.1 },
            { name: 'Main Frame', watt: 2000, roomId: r3._id, usageProbability: 1.0 },
        ];

        await Device.insertMany(devices);

        console.log('Database seeded successfully! 🌱');
        process.exit();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
