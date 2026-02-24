const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an institution name'],
        unique: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Institution', InstitutionSchema);
