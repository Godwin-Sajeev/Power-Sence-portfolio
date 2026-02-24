const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
}).then(() => console.log('MongoDB Connected for College Seeding'))
    .catch(err => console.error(err));

// Use Actual Mongoose Models
const Institution = require('./models/Institution');
const Building = require('./models/Building');
const Room = require('./models/Room');
const Device = require('./models/Device');
const seedCollegeData = async () => {
    try {
        console.log('Clearing old data...');
        await Device.deleteMany();
        await Room.deleteMany();
        await Building.deleteMany();
        await Institution.deleteMany();

        console.log('Creating Root Institution...');
        const college = await Institution.create({
            name: 'University College of Engineering'
        });

        console.log('Creating Buildings...');
        const groundFloor = await Building.create({
            name: 'Engineering Block - Ground Floor',
            institutionId: college._id
        });

        const firstFloor = await Building.create({
            name: 'Engineering Block - 1st Floor',
            institutionId: college._id
        });

        console.log('Creating college rooms with SVG map coordinates...');

        // --- GROUND FLOOR ---
        const ccfLab = await Room.create({
            name: 'CCF Lab',
            buildingId: groundFloor._id,
            workingHoursStart: '08:00',
            workingHoursEnd: '18:00',
            mapCoordinates: { x: 100, y: 150, width: 300, height: 250 }
        });

        const office = await Room.create({
            name: 'Office',
            buildingId: groundFloor._id,
            workingHoursStart: '08:30',
            workingHoursEnd: '17:30',
            mapCoordinates: { x: 450, y: 150, width: 200, height: 120 }
        });

        const principalOffice = await Room.create({
            name: 'Principal Office',
            buildingId: groundFloor._id,
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            mapCoordinates: { x: 450, y: 290, width: 200, height: 110 }
        });

        // --- 1ST FLOOR ---
        const class1 = await Room.create({
            name: 'Class 1', buildingId: firstFloor._id, workingHoursStart: '09:00', workingHoursEnd: '16:00', mapCoordinates: { x: 100, y: 100, width: 180, height: 150 }
        });
        const class2 = await Room.create({
            name: 'Class 2', buildingId: firstFloor._id, workingHoursStart: '09:00', workingHoursEnd: '16:00', mapCoordinates: { x: 310, y: 100, width: 180, height: 150 }
        });
        const class3 = await Room.create({
            name: 'Class 3', buildingId: firstFloor._id, workingHoursStart: '09:00', workingHoursEnd: '16:00', mapCoordinates: { x: 520, y: 100, width: 180, height: 150 }
        });

        const library = await Room.create({
            name: 'Library',
            buildingId: firstFloor._id,
            workingHoursStart: '08:00',
            workingHoursEnd: '18:00',
            mapCoordinates: { x: 100, y: 280, width: 600, height: 250 }
        });

        console.log('Populating devices...');
        const allDevices = [];

        // Ground Floor - CCF Lab (10 computers, 5 fans)
        for (let i = 1; i <= 10; i++) allDevices.push({ name: `Computer ${i}`, deviceType: 'Computer', watt: 250, status: 'OFF', roomId: ccfLab._id });
        for (let i = 1; i <= 5; i++) allDevices.push({ name: `Fan ${i}`, deviceType: 'HVAC', watt: 70, status: 'OFF', roomId: ccfLab._id });

        // Ground Floor - Office (3 fans, 2 lights)
        for (let i = 1; i <= 3; i++) allDevices.push({ name: `Fan ${i}`, deviceType: 'HVAC', watt: 70, status: 'OFF', roomId: office._id });
        for (let i = 1; i <= 2; i++) allDevices.push({ name: `Light ${i}`, deviceType: 'Lighting', watt: 40, status: 'OFF', roomId: office._id });

        // Ground Floor - Principal Office (1 fan, 1 light)
        allDevices.push({ name: `Fan 1`, deviceType: 'HVAC', watt: 70, status: 'OFF', roomId: principalOffice._id });
        allDevices.push({ name: `Light 1`, deviceType: 'Lighting', watt: 40, status: 'OFF', roomId: principalOffice._id });

        // 1st Floor - 3 Classes (each: 4 fans, 2 lights)
        const classes = [class1, class2, class3];
        classes.forEach((cls) => {
            for (let i = 1; i <= 4; i++) allDevices.push({ name: `Fan ${i}`, deviceType: 'HVAC', watt: 70, status: 'OFF', roomId: cls._id });
            for (let i = 1; i <= 2; i++) allDevices.push({ name: `Light ${i}`, deviceType: 'Lighting', watt: 40, status: 'OFF', roomId: cls._id });
        });

        // 1st Floor - Library (4 lights, 4 fans)
        for (let i = 1; i <= 4; i++) allDevices.push({ name: `Fan ${i}`, deviceType: 'HVAC', watt: 70, status: 'OFF', roomId: library._id });
        for (let i = 1; i <= 4; i++) allDevices.push({ name: `Light ${i}`, deviceType: 'Lighting', watt: 40, status: 'OFF', roomId: library._id });

        await Device.insertMany(allDevices);

        console.log('✅ Specific college data successfully fully integrated!');
        process.exit();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedCollegeData();
