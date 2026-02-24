require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log("URI:", process.env.MONGO_URI.substring(0, 40) + "...");
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log("✅ Successfully connected!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to connect:");
        console.error(err);
        process.exit(1);
    }
}

testConnection();
