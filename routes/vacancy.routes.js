const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancy.controller');

// Get all vacancies with pagination and filtering
router.get('/', vacancyController.getAllVacancies);

// Get vacancy by ID
router.get('/:id', vacancyController.getVacancyById);

// Create new vacancy
router.post('/', vacancyController.createVacancy);

// Update vacancy
router.put('/:id', vacancyController.updateVacancy);

// Delete vacancy
router.delete('/:id', vacancyController.deleteVacancy);

module.exports = router; 