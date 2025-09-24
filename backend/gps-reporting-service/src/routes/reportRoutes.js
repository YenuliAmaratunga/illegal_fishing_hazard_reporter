const express = require('express');
const router = express.Router();
const { 
    reportViolation,
    getViolationReports,
    verifyViolationReport,
    reportHazard,
    getHazardReports,
    resolveHazardReport
} = require('../controllers/reportController');

// Violation Report Routes
router.post('/violation-reports', reportViolation);
router.get('/violation-reports', getViolationReports);
router.put('/violation-reports/:reportId/verify', verifyViolationReport);

// Hazard Report Routes
router.post('/hazard-reports', reportHazard);
router.get('/hazard-reports', getHazardReports);
router.put('/hazard-reports/:reportId/resolve', resolveHazardReport);

module.exports = router;