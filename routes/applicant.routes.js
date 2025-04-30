const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant.controller');

// Get all applicants with pagination and filtering
router.get('/', applicantController.getAllApplicants);

// Get applicant by ID
router.get('/:id', applicantController.getApplicantById);

// Create new applicant
router.post('/', applicantController.createApplicant);

// Update applicant status
router.put('/:id/status', applicantController.updateApplicantStatus);

// Delete applicant
router.delete('/:id', applicantController.deleteApplicant);

module.exports = router; 