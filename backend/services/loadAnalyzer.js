const Alert = require('../models/Alert');
const Device = require('../models/Device');
const ReportLog = require('../models/ReportLog');
const { getMLPrediction } = require('./mlService');

/**
 * Checks if current time is outside working hours
 */
const isAfterHours = (start, end) => {
    // FORCE-ENABLED FOR TESTING ANOMALIES DURING THE DAY
    return true;
};

/**
 * Subset Sum Algorithm to find device combinations
 */
const findMatchingDevices = (devices, targetWatt, tolerance = 2) => {
    let bestMatch = [];
    let bestDelta = Infinity;

    const generate = (index, currentSubset, currentSum) => {
        const delta = Math.abs(currentSum - targetWatt);
        if (delta <= tolerance) {
            if (delta < bestDelta) {
                bestDelta = delta;
                bestMatch = [...currentSubset];
            }
        }

        if (index === devices.length || currentSum > targetWatt + tolerance) return;

        // Include
        generate(index + 1, [...currentSubset, devices[index]], currentSum + devices[index].watt);
        // Exclude
        generate(index + 1, currentSubset, currentSum);
    };

    generate(0, [], 0);
    return bestMatch;
};

/**
 * Main Analysis Function
 */
const analyzeReading = async (room, measuredWatt, io) => {
    if (!isAfterHours(room.workingHoursStart, room.workingHoursEnd)) {
        return { status: 'normal', reason: 'within_hours' };
    }

    if (measuredWatt <= room.standbyThresholdWatt) {
        return { status: 'normal', reason: 'below_threshold' };
    }

    // After-hours anomaly detected
    const devices = await Device.find({ roomId: room._id });
    const matchingDevices = findMatchingDevices(devices, measuredWatt);

    // Get ML Prediction
    const mlResult = await getMLPrediction(room._id, measuredWatt);

    if (matchingDevices.length > 0 || mlResult.isAnomaly) {
        // Calculate deterministic match score (0-100)
        // If we found a match, let's say it's 80% confidence, otherwise 0
        const matchScore = matchingDevices.length > 0 ? 80 : 0;

        // Combine Match Score (60%) and ML Anomaly Score (40%)
        const combinedConfidence = Math.round((matchScore * 0.6) + (mlResult.anomalyScore * 0.4));

        const alert = await Alert.create({
            roomId: room._id,
            measuredWatt,
            suspectedDevices: matchingDevices.map(d => d._id),
            status: 'active',
            mlScore: mlResult.anomalyScore,
            mlAverage: mlResult.averageUsage,
            confidence: combinedConfidence
        });

        // Calculate waste & impact
        const energyWasted = measuredWatt / 1000; // kWh for 1 hour
        const cost = energyWasted * 10; // ₹10 per kWh
        const carbon = energyWasted * 0.85; // 0.85 kg CO2 per kWh

        await ReportLog.create({
            roomId: room._id,
            wastedEnergy: energyWasted,
            cost,
            carbonEmission: carbon
        });

        const populatedAlert = await Alert.findById(alert._id)
            .populate('roomId')
            .populate('suspectedDevices');

        // Notify UI of new alert
        if (io) {
            io.emit('new_alert', populatedAlert);
        }

        return { status: 'anomaly', alert: populatedAlert };
    }

    return { status: 'anomaly', reason: 'no_match_found' };
};

module.exports = { analyzeReading };
