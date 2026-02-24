const PowerReading = require('../models/PowerReading');
const Room = require('../models/Room');
const Device = require('../models/Device');
const Alert = require('../models/Alert');
const { isAfterHours, findCombinations } = require('../utils/analysisEngine');

// @desc    Receive live power reading and analyze
// @route   POST /api/power
// @access  Public (Simulated for Now)
exports.postPowerReading = async (req, res) => {
    try {
        const { roomId, measuredLoad } = req.body;

        if (!roomId || measuredLoad === undefined) {
            return res.status(400).json({ success: false, error: 'Please provide roomId and measuredLoad' });
        }

        // 1. Log the reading
        const reading = await PowerReading.create({
            room: roomId,
            measuredLoad
        });

        // 2. Retrieve room and building info
        const room = await Room.findById(roomId).populate('building');
        if (!room) {
            return res.status(404).json({ success: false, error: 'Room not found' });
        }

        const building = room.building;
        const afterHours = isAfterHours(building.workingHours);

        let alertTriggered = false;
        let alert = null;

        // 3. Check for anomalies if after-hours
        if (afterHours && measuredLoad > room.standbyThreshold) {
            // Retrieve all devices in the room
            const devices = await Device.find({ room: roomId });

            // 4. Load Analysis Engine
            const combinations = findCombinations(devices, measuredLoad);

            if (combinations.length > 0) {
                // 5. Intelligent Scoring (Top combinations are already sorted)
                // Filter combinations to keep only the most likely ones (e.g., top 3)
                const possibleCombinations = combinations.slice(0, 3);

                // 6. Anomaly Confirmation & Alerting
                // Trigger alert if confidence > threshold (let's say 40% for start)
                if (possibleCombinations[0].confidence > 40) {
                    // Calculate dummy cost/energy waste
                    // Assume 1 hour of such waste as a base for logging
                    const wastedEnergy = (measuredLoad / 1000); // kWh if kept for 1h
                    const estimatedCost = wastedEnergy * 0.15; // Assume $0.15 per kWh

                    alert = await Alert.create({
                        room: roomId,
                        measuredLoad,
                        possibleCombinations,
                        wastedEnergy,
                        estimatedCost,
                        timestamp: new Date()
                    });

                    alertTriggered = true;
                }
            }
        }

        res.status(201).json({
            success: true,
            data: reading,
            alertTriggered,
            alert: alertTriggered ? alert : null
        });

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all readings for a room
// @route   GET /api/power/:roomId
exports.getRoomReadings = async (req, res) => {
    try {
        const readings = await PowerReading.find({ room: req.params.roomId }).sort('-timestamp').limit(100);
        res.status(200).json({ success: true, count: readings.length, data: readings });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
