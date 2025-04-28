const express = require('express');
const {
  getHourLogs,
  getHourLogsByRange,
  createHourLog,
  updateHourLog,
  deleteHourLog,
} = require('../controllers/hours');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getHourLogs).post(protect, createHourLog);
router.route('/range').get(protect, getHourLogsByRange);
router
  .route('/:id')
  .put(protect, updateHourLog)
  .delete(protect, deleteHourLog);

module.exports = router;