const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

const ML_SERVER_URL = 'http://localhost:5500';
let pythonProcess = null;

/**
 * Starts the Python ML Service as a background process
 */
const startMLService = () => {
    const scriptPath = path.join(__dirname, '../ml/ml_service.py');
    console.log(`Starting Python ML Service from: ${scriptPath}`);

    pythonProcess = spawn('python', [scriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`ML Service: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`ML Service Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`ML Service process exited with code ${code}`);
    });
};

/**
 * Calls the ML service to get anomaly prediction
 * @param {String} roomId 
 * @param {Number} watt 
 * @returns {Object} { isAnomaly: Boolean, anomalyScore: Number, averageUsage: Number, deviation: Number }
 */
const getMLPrediction = async (roomId, watt) => {
    try {
        const response = await axios.post(`${ML_SERVER_URL}/predict`, {
            roomId,
            watt
        });
        return response.data;
    } catch (err) {
        console.error('Failed to get ML prediction:', err.message);
        // Fallback to safe defaults if ML service is down
        return {
            isAnomaly: false,
            anomalyScore: 0,
            averageUsage: watt,
            deviation: 0,
            error: true
        };
    }
};

module.exports = {
    startMLService,
    getMLPrediction
};
