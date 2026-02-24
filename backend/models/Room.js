const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a room name'],
        trim: true
    },
    buildingId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Building',
        required: true
    },
    workingHoursStart: {
        type: String,
        default: '09:00'
    },
    workingHoursEnd: {
        type: String,
        default: '17:00'
    },
    standbyThresholdWatt: {
        type: Number,
        default: 5
    },
    mapCoordinates: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);
