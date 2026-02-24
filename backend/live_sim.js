const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room');

dotenv.config();

const API_URL = 'http://localhost:5000/api';

const simReadings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const rooms = await Room.find();

        if (rooms.length === 0) {
            console.log('No rooms found. Seed the database first.');
            process.exit(1);
        }

        console.log(`Starting live simulation for ${rooms.length} rooms...`);

        setInterval(async () => {
            for (const room of rooms) {
                const watt = Math.floor(Math.random() * 500) + 10;
                try {
                    await axios.post(`${API_URL}/reading`, {
                        roomId: room._id,
                        watt
                    });
                    console.log(`Sent: Room ${room.name} -> ${watt}W`);
                } catch (e) {
                    console.error(`Error sending for ${room.name}:`, e.message);
                }
            }
        }, 3000);

    } catch (err) {
        console.error('Sim failed:', err.message);
    }
};

simReadings();
