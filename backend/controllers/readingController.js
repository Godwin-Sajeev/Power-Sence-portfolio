const MeterReading = require('../models/MeterReading');
const Room = require('../models/Room');
const { analyzeReading } = require('../services/loadAnalyzer');

exports.postReading = async (req, res) => {
    try {
        const { roomId, watt } = req.body;
        const reading = await MeterReading.create({ roomId, watt });

        const room = await Room.findById(roomId);
        if (room) {
            await analyzeReading(room, watt, req.io);
        }

        // Notify UI of new reading
        req.io.emit('new_reading', { roomId, watt, timestamp: reading.timestamp });

        res.status(201).json(reading);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getReadings = async (req, res) => {
    try {
        const r = await MeterReading.find().sort('-timestamp').limit(50);
        res.status(200).json(r);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
