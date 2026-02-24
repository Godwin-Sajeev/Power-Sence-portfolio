const Building = require('../models/Building');

exports.createBuilding = async (req, res) => {
    try {
        const b = await Building.create(req.body);
        res.status(201).json(b);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getBuildings = async (req, res) => {
    try {
        const query = req.params.institutionId ? { institutionId: req.params.institutionId } : {};
        const b = await Building.find(query);
        res.status(200).json(b);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteBuilding = async (req, res) => {
    try {
        await Building.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Building deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
