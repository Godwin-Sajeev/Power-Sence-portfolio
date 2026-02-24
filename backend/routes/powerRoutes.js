const express = require('express');
const {
    postPowerReading,
    getRoomReadings
} = require('../controllers/powerController');

const router = express.Router();

router.route('/')
    .post(postPowerReading);

router.route('/:roomId')
    .get(getRoomReadings);

module.exports = router;
