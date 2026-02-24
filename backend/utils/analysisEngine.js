/**
 * Checks if the current time is outside the working hours of a building.
 * @param {Object} workingHours - { start: 'HH:mm', end: 'HH:mm' }
 * @param {Date} currentTime - Date object
 * @returns {Boolean} - True if outside working hours
 */
const isAfterHours = (workingHours, currentTime = new Date()) => {
    const { start, end } = workingHours;

    // Get current time in HH:mm
    const currentStr = currentTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // Simple string comparison for HH:mm
    if (start <= end) {
        // Normal case (e.g., 09:00 - 17:00)
        return currentStr < start || currentStr > end;
    } else {
        // Overnight case (e.g., 22:00 - 06:00)
        return currentStr < start && currentStr > end;
    }
};

/**
 * Finds combinations of devices whose wattage sum matches the targeted load.
 * @param {Array} devices - Array of device objects { _id, wattage, usageProbability }
 * @param {Number} targetLoad - Measured load in Watts
 * @param {Number} tolerance - Allowed deviation in Watts
 * @returns {Array} - Array of { devices: [], totalWattage: Number, confidence: Number }
 */
const findCombinations = (devices, targetLoad, tolerance = 2) => {
    let result = [];

    const generate = (index, currentSubset, currentSum) => {
        if (index === devices.length) {
            if (Math.abs(currentSum - targetLoad) <= tolerance && currentSum > 0) {
                // Calculate confidence score
                // Score = (Power Fit Accuracy) + (Usage Probability Weight)
                const accuracy = 1 - (Math.abs(currentSum - targetLoad) / (targetLoad || 1));

                // Weight based on probabilities of devices being left on
                const avgProb = currentSubset.reduce((sum, d) => sum + d.usageProbability, 0) / currentSubset.length;

                // Final confidence (normalized roughly to 0-100)
                const confidence = (accuracy * 0.6 + avgProb * 0.4) * 100;

                result.push({
                    devices: currentSubset.map(d => d._id),
                    totalWattage: currentSum,
                    confidence: Math.round(confidence)
                });
            }
            return;
        }

        // Include device
        generate(index + 1, [...currentSubset, devices[index]], currentSum + devices[index].wattage);

        // Exclude device
        generate(index + 1, currentSubset, currentSum);
    };

    generate(0, [], 0);

    // Sort by confidence
    return result.sort((a, b) => b.confidence - a.confidence);
};

module.exports = {
    isAfterHours,
    findCombinations
};
