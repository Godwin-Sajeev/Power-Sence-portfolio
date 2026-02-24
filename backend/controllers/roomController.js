const Room = require('../models/Room');

exports.createRoom = async (req, res) => {
    try {
        const r = await Room.create(req.body);
        res.status(201).json(r);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const filter = req.query.buildingId ? { buildingId: req.query.buildingId } : {};
        const r = await Room.find(filter).populate('buildingId');
        res.status(200).json(r);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteRoom = async (req, res) => {
    try {
        await Room.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
