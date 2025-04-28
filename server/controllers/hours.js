const HourLog = require('../models/HourLog');
const asyncHandler = require('express-async-handler');

// @desc    Get all hour logs
// @route   GET /api/hours
// @access  Private
const getHourLogs = asyncHandler(async (req, res) => {
  const hourLogs = await HourLog.find({ user: req.user.id });
  res.status(200).json(hourLogs);
});

// @desc    Get hour logs by date range
// @route   GET /api/hours/range
// @access  Private
const getHourLogsByRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide start and end dates');
  }

  const hourLogs = await HourLog.find({
    user: req.user.id,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  res.status(200).json(hourLogs);
});

// @desc    Create hour log
// @route   POST /api/hours
// @access  Private
const createHourLog = asyncHandler(async (req, res) => {
  const { date, hours, description } = req.body;

  if (!date || !hours || !description) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const hourLog = await HourLog.create({
    date,
    hours,
    description,
    user: req.user.id,
  });

  res.status(201).json(hourLog);
});

// @desc    Update hour log
// @route   PUT /api/hours/:id
// @access  Private
const updateHourLog = asyncHandler(async (req, res) => {
  const hourLog = await HourLog.findById(req.params.id);

  if (!hourLog) {
    res.status(404);
    throw new Error('Hour log not found');
  }

  // Make sure user owns the hour log
  if (hourLog.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedHourLog = await HourLog.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json(updatedHourLog);
});

// @desc    Delete hour log
// @route   DELETE /api/hours/:id
// @access  Private
const deleteHourLog = asyncHandler(async (req, res) => {
  const hourLog = await HourLog.findById(req.params.id);

  if (!hourLog) {
    res.status(404);
    throw new Error('Hour log not found');
  }

  // Make sure user owns the hour log
  if (hourLog.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await hourLog.remove();

  res.status(200).json({ success: true });
});

module.exports = {
  getHourLogs,
  getHourLogsByRange,
  createHourLog,
  updateHourLog,
  deleteHourLog,
};