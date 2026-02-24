const mongoose = require('mongoose');

const MeterReadingSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    watt: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('MeterReading', MeterReadingSchema);
