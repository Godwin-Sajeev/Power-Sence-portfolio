const Alert = require('../models/Alert');
const ReportLog = require('../models/ReportLog');

exports.getAlerts = async (req, res) => {
    try {
        const a = await Alert.find()
            .populate('roomId')
            .populate('suspectedDevices')
            .sort('-createdAt');
        res.status(200).json(a);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.patchAlert = async (req, res) => {
    try {
        const a = await Alert.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(a);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getWeeklyReports = async (req, res) => {
    try {
        const stats = await ReportLog.aggregate([
            {
                $group: {
                    _id: "$roomId",
                    totalWasted: { $sum: "$wastedEnergy" },
                    totalCost: { $sum: "$cost" },
                    totalCarbon: { $sum: "$carbonEmission" }
                }
            },
            {
                $lookup: {
                    from: 'rooms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            { $unwind: "$room" }
        ]);

        const totals = await ReportLog.aggregate([
            {
                $group: {
                    _id: null,
                    wasted: { $sum: "$wastedEnergy" },
                    cost: { $sum: "$cost" },
                    carbon: { $sum: "$carbonEmission" }
                }
            }
        ]);

        res.status(200).json({ stats, totals: totals[0] || { wasted: 0, cost: 0, carbon: 0 } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
