const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a device name'],
        trim: true
    },
    watt: {
        type: Number,
        required: [true, 'Please add wattage rating'],
    },
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Room',
        required: true
    },
    usageProbability: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Device', DeviceSchema);
