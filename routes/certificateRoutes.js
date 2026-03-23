const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates,
  revokeCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/verify/:certificateNumber', verifyCertificate);

// User routes
router.post('/generate/:assignmentId', protect, generateCertificate);
router.get('/my-certificates', protect, getMyCertificates);
router.get('/:id', protect, getCertificate);
router.get('/:id/download', protect, downloadCertificate);

// Admin routes
router.get('/', protect, authorize('admin'), getAllCertificates);
router.put('/:id/revoke', protect, authorize('admin'), revokeCertificate);

module.exports = router;
