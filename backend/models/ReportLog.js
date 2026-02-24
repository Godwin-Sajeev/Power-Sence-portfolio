const mongoose = require('mongoose');

const ReportLogSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    wastedEnergy: {
        type: Number, // kWh
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    carbonEmission: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ReportLog', ReportLogSchema);
