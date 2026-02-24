const mongoose = require('mongoose');

const BuildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a building name'],
        trim: true
    },
    institutionId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Institution',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Building', BuildingSchema);
