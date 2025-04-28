const Report = require('../models/Report');
const asyncHandler = require('express-async-handler');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
  let query = { user: req.user.id };

  // If user is manager or admin, get all reports
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    query = {};
  }

  const reports = await Report.find(query).populate('user', 'name email');
  res.status(200).json(reports);
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Make sure user owns the report or is manager/admin
  if (
    report.user._id.toString() !== req.user.id &&
    req.user.role !== 'manager' &&
    req.user.role !== 'admin'
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(report);
});

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { title, content, status } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  const report = await Report.create({
    title,
    content,
    status: status || 'draft',
    user: req.user.id,
  });

  res.status(201).json(report);
});

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Make sure user owns the report or is manager/admin
  if (
    report.user.toString() !== req.user.id &&
    req.user.role !== 'manager' &&
    req.user.role !== 'admin'
  ) {
    res.status(401);
    throw new Error('Not authorized');
  }

  // Only allow status update for managers/admins if they don't own the report
  if (
    report.user.toString() !== req.user.id &&
    (req.user.role === 'manager' || req.user.role === 'admin')
  ) {
    if (req.body.status && req.body.status !== report.status) {
      report.status = req.body.status;
      await report.save();
      return res.status(200).json(report);
    }
    res.status(400);
    throw new Error('Only status can be updated by managers/admins');
  }

  const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedReport);
});

// @desc    Submit report
// @route   PUT /api/reports/:id/submit
// @access  Private
const submitReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Make sure user owns the report
  if (report.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  report.status = 'submitted';
  report.submittedAt = Date.now();
  await report.save();

  res.status(200).json(report);
});

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }

  // Make sure user owns the report
  if (report.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await report.remove();

  res.status(200).json({ success: true });
});

module.exports = {
  getReports,
  getReport,
  createReport,
  updateReport,
  submitReport,
  deleteReport,
};