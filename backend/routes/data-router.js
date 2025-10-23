const express = require('express');

const router = express.Router();

const {
  getAllData,
  getDataById,
  addNewData,
  updateDataById,
  deleteDataById,
  deleteAllData,
} = require('../controllers/dataController');

// Get all data with optional limit query parameter
router.get('/', getAllData);

// Get data by ID
router.get('/:id', getDataById);

// Add new data
router.post('/', addNewData);

// Update data by ID
router.put('/:id', updateDataById);

// Delete data by ID
router.delete('/:id', deleteDataById);

// Delete all data
router.delete('/', deleteAllData);

module.exports = router;
