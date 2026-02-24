const express = require('express');
const { createRoom, getRooms, deleteRoom } = require('../controllers/roomController');
const router = express.Router();

router.post('/', createRoom);
router.get('/:buildingId', getRooms);
router.get('/', getRooms);
router.delete('/:id', deleteRoom);

module.exports = router;
