const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    measuredWatt: {
        type: Number,
        required: true
    },
    suspectedDevices: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Device'
    }],
    confidenceScores: [{
        type: Number
    }],
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    mlScore: {
        type: Number,
        default: 0
    },
    mlAverage: {
        type: Number,
        default: 0
    },
    confidence: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', AlertSchema);
