const Certificate = require('../models/Certificate');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Generate certificate for completed assignment
// @route   POST /api/certificates/generate/:assignmentId
// @access  Private
const generateCertificate = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('courseId')
      .populate('employeeId');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if assignment is completed
    if (assignment.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Assignment must be completed to generate certificate'
      });
    }

    // Check if user owns this assignment
    if (assignment.employeeId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if certificate already exists
    const existingCert = await Certificate.findOne({
      user: assignment.employeeId._id,
      course: assignment.courseId._id,
      assignment: assignment._id
    });

    if (existingCert) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already exists',
        data: existingCert
      });
    }

    // Calculate completion time
    const completionTime = assignment.completionDate && assignment.assignedAt
      ? Math.round((assignment.completionDate - assignment.assignedAt) / (1000 * 60 * 60))
      : 0;

    // Create certificate
    const certificate = await Certificate.create({
      user: assignment.employeeId._id,
      course: assignment.courseId._id,
      assignment: assignment._id,
      score: assignment.score,
      grade: calculateGrade(assignment.score),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Valid for 1 year
      metadata: {
        completionTime,
        attempts: assignment.attempts.length,
        moduleCount: assignment.courseId.modules.length
      }
    });

    await certificate.populate([
      { path: 'user', select: 'name email department' },
      { path: 'course', select: 'title description riskLevel' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title description riskLevel')
      .sort({ issuedDate: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Private
const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name email department')
      .populate('course', 'title description riskLevel');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check authorization
    if (certificate.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:certificateNumber
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ 
      certificateNumber: req.params.certificateNumber 
    })
      .populate('user', 'name email')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
        verified: false
      });
    }

    const isValid = certificate.isValid();

    res.status(200).json({
      success: true,
      verified: isValid,
      data: {
        certificateNumber: certificate.certificateNumber,
        userName: certificate.user.name,
        courseTitle: certificate.course.title,
        issuedDate: certificate.issuedDate,
        score: certificate.score,
        grade: certificate.grade,
        status: certificate.status,
        validUntil: certificate.validUntil
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

// @desc    Download certificate (Mock - returns JSON for now)
// @route   GET /api/certificates/:id/download
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name email department')
      .populate('course', 'title description');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check authorization
    if (certificate.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Increment download count
    certificate.downloadCount += 1;
    await certificate.save();

    // Generate certificate data (can be enhanced with PDF generation)
    const certificateData = {
      certificateNumber: certificate.certificateNumber,
      issuedTo: certificate.user.name,
      email: certificate.user.email,
      department: certificate.user.department,
      courseTitle: certificate.course.title,
      courseDescription: certificate.course.description,
      completedDate: certificate.issuedDate,
      score: certificate.score,
      grade: certificate.grade,
      validUntil: certificate.validUntil,
      issuer: 'Women Walnut Learning Management System',
      signature: 'Authorized Signature',
      seal: 'Official Seal'
    };

    // For now, return JSON (can be enhanced to generate PDF)
    res.status(200).json({
      success: true,
      message: 'Certificate data retrieved',
      data: certificateData,
      note: 'In production, this would generate and download a PDF certificate'
    });

    // TODO: Enhance with PDF generation using PDFKit or similar
    // const pdf = generatePDFCertificate(certificateData);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);
    // pdf.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all certificates (Admin)
// @route   GET /api/certificates
// @access  Private/Admin
const getAllCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId, courseId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (courseId) query.course = courseId;

    const skip = (page - 1) * limit;

    const certificates = await Certificate.find(query)
      .populate('user', 'name email department')
      .populate('course', 'title riskLevel')
      .sort({ issuedDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      count: certificates.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: certificates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Revoke certificate (Admin)
// @route   PUT /api/certificates/:id/revoke
// @access  Private/Admin
const revokeCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status: 'revoked' },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate revoked successfully',
      data: certificate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate grade
function calculateGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  return 'Pass';
}

module.exports = {
  generateCertificate,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates,
  revokeCertificate
};
