const mongoose = require('mongoose');
require('dotenv').config();

const Institution = require('./models/Institution');
const Building = require('./models/Building');
const Room = require('./models/Room');
const Device = require('./models/Device');
const Alert = require('./models/Alert');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energize');
        console.log('Connected to MongoDB for seeding...');

        // 1. Create Institution
        const inst = await Institution.create({ name: 'PowerSense Academy' });
        console.log('Seed: Institution created');

        // 2. Create Building
        const build = await Building.create({
            name: 'Science & Tech Block',
            institutionId: inst._id
        });
        console.log('Seed: Building created');

        // 3. Create Rooms
        const rooms = await Room.create([
            {
                name: 'Physics Lab',
                buildingId: build._id,
                workingHoursStart: '08:00',
                workingHoursEnd: '18:00',
                x: 150, y: 150, width: 200, height: 150
            },
            {
                name: 'Server Room',
                buildingId: build._id,
                workingHoursStart: '00:00',
                workingHoursEnd: '23:59',
                x: 400, y: 150, width: 150, height: 150
            }
        ]);
        console.log('Seed: Rooms created');

        // 4. Create Devices
        await Device.create([
            { name: 'AC Unit', watt: 1500, roomId: rooms[0]._id },
            { name: 'LCD Projector', watt: 300, roomId: rooms[0]._id },
            { name: 'Main Server Rack', watt: 2500, roomId: rooms[1]._id }
        ]);
        console.log('Seed: Devices created');

        // 5. Create some dummy Alerts for Analytics
        await Alert.create([
            { roomId: rooms[0]._id, measuredWatt: 1800, status: 'active', suspectedDevices: [] },
            { roomId: rooms[0]._id, measuredWatt: 400, status: 'resolved', suspectedDevices: [] }
        ]);

        console.log('Seeding complete! Ready for demo.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
