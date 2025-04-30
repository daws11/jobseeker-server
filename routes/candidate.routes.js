const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidate.controller');

// Get all candidates with pagination and filtering
router.get('/', candidateController.getAllCandidates);

// Get candidate by ID
router.get('/:id', candidateController.getCandidateById);

// Create new candidate
router.post('/', candidateController.createCandidate);

// Update candidate
router.put('/:id', candidateController.updateCandidate);

// Delete candidate
router.delete('/:id', candidateController.deleteCandidate);

module.exports = router; 