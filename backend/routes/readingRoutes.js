const express = require('express');
const { postReading, getReadings } = require('../controllers/readingController');
const router = express.Router();

router.post('/', postReading);
router.get('/', getReadings);

module.exports = router;
