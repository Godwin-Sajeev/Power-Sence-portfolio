const express = require('express');
const { createInstitution, getInstitutions, deleteInstitution } = require('../controllers/institutionController');
const router = express.Router();

router.post('/', createInstitution);
router.get('/', getInstitutions);
router.delete('/:id', deleteInstitution);

module.exports = router;
