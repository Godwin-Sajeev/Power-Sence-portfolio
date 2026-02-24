const express = require('express');
const { getAlerts, patchAlert, getWeeklyReports } = require('../controllers/alertController');
const router = express.Router();

router.get('/', getAlerts);
router.patch('/:id', patchAlert);
router.get('/reports/weekly', getWeeklyReports);

module.exports = router;
