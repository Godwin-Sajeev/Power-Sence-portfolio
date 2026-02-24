const express = require('express');
const { createDevice, getDevices, deleteDevice } = require('../controllers/deviceController');
const router = express.Router();

router.post('/', createDevice);
router.get('/:roomId', getDevices);
router.get('/', getDevices);
router.delete('/:id', deleteDevice);

module.exports = router;
