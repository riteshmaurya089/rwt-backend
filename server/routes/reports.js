const express = require('express');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  submitReport,
  deleteReport,
} = require('../controllers/reports');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getReports).post(protect, createReport);
router.route('/:id').get(protect, getReport).put(protect, updateReport).delete(protect, deleteReport);
router.route('/:id/submit').put(protect, submitReport);

module.exports = router;