const express = require('express');
const { createBuilding, getBuildings, deleteBuilding } = require('../controllers/buildingController');
const router = express.Router();

router.post('/', createBuilding);
router.get('/:institutionId', getBuildings);
router.get('/', getBuildings);
router.delete('/:id', deleteBuilding);

module.exports = router;
