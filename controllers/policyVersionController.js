const PolicyVersion = require('../models/PolicyVersion');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Create new policy version
// @route   POST /api/policy-versions
// @access  Private/Admin
const createPolicyVersion = async (req, res) => {
  try {
    const { courseId, title, description, changes, content, effectiveDate, expiryDate, requiresRetraining } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get latest version number
    const latestVersion = await PolicyVersion.findOne({ course: courseId })
      .sort({ versionNumber: -1 });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    const version = `v${versionNumber}.0`;

    const policyVersion = await PolicyVersion.create({
      course: courseId,
      version,
      versionNumber,
      title: title || course.title,
      description: description || course.description,
      changes,
      content,
      publishedBy: req.user._id,
      effectiveDate: effectiveDate || new Date(),
      expiryDate,
      requiresRetraining: requiresRetraining || false
    });

    // If requires retraining, notify relevant users
    if (requiresRetraining) {
      const usersToNotify = await User.find({
        role: 'employee',
        completedCourses: {
          $elemMatch: { courseId: courseId }
        }
      }).select('_id');

      policyVersion.notifiedUsers = usersToNotify.map(u => u._id);
      await policyVersion.save();
    }

    await policyVersion.populate('publishedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Policy version created successfully',
      data: policyVersion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all policy versions for a course
// @route   GET /api/policy-versions/course/:courseId
// @access  Private
const getPolicyVersionsByCourse = async (req, res) => {
  try {
    const versions = await PolicyVersion.find({ course: req.params.courseId })
      .populate('publishedBy', 'name email')
      .sort({ versionNumber: -1 });

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get latest policy version
// @route   GET /api/policy-versions/course/:courseId/latest
// @access  Private
const getLatestPolicyVersion = async (req, res) => {
  try {
    const latestVersion = await PolicyVersion.findOne({ 
      course: req.params.courseId,
      status: 'published'
    })
      .populate('publishedBy', 'name email')
      .sort({ versionNumber: -1 });

    if (!latestVersion) {
      return res.status(404).json({
        success: false,
        message: 'No policy versions found'
      });
    }

    res.status(200).json({
      success: true,
      data: latestVersion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Compare two policy versions
// @route   GET /api/policy-versions/compare/:id1/:id2
// @access  Private/Admin
const comparePolicyVersions = async (req, res) => {
  try {
    const [version1, version2] = await Promise.all([
      PolicyVersion.findById(req.params.id1),
      PolicyVersion.findById(req.params.id2)
    ]);

    if (!version1 || !version2) {
      return res.status(404).json({
        success: false,
        message: 'One or both versions not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        version1: {
          version: version1.version,
          publishedAt: version1.publishedAt,
          changes: version1.changes
        },
        version2: {
          version: version2.version,
          publishedAt: version2.publishedAt,
          changes: version2.changes
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Archive policy version
// @route   PUT /api/policy-versions/:id/archive
// @access  Private/Admin
const archivePolicyVersion = async (req, res) => {
  try {
    const version = await PolicyVersion.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!version) {
      return res.status(404).json({
        success: false,
        message: 'Policy version not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Policy version archived',
      data: version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createPolicyVersion,
  getPolicyVersionsByCourse,
  getLatestPolicyVersion,
  comparePolicyVersions,
  archivePolicyVersion
};
