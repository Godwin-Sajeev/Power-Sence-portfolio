const mongoose = require('mongoose');

const PowerReadingSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    measuredLoad: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PowerReading', PowerReadingSchema);
