const Institution = require('../models/Institution');

exports.createInstitution = async (req, res) => {
    try {
        const inst = await Institution.create(req.body);
        res.status(201).json(inst);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getInstitutions = async (req, res) => {
    try {
        const insts = await Institution.find();
        res.status(200).json(insts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteInstitution = async (req, res) => {
    try {
        await Institution.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Institution deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
