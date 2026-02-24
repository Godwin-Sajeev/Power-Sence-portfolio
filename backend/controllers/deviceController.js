const Device = require('../models/Device');

exports.createDevice = async (req, res) => {
    try {
        const d = await Device.create(req.body);
        res.status(201).json(d);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getDevices = async (req, res) => {
    try {
        const query = req.params.roomId ? { roomId: req.params.roomId } : {};
        const d = await Device.find(query);
        res.status(200).json(d);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteDevice = async (req, res) => {
    try {
        await Device.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Device deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
