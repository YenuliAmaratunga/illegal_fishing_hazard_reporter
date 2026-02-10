const express = require('express');
const router = express.Router();
const { 
    reportViolation,
    getViolationReports,
    verifyViolationReport,
    reportHazard,
    getHazardReports,
    resolveHazardReport,
    resolveViolationReport,
    getMyReports,
    updateViolationReport,
    updateHazardReport
} = require('../controllers/reportController');

router.get("/my", getMyReports);

// Violation Report Routes
router.post('/violation-reports', reportViolation);
router.get('/violation-reports', getViolationReports);
router.put('/violation-reports/:reportId/verify', verifyViolationReport);
router.put('/violation-reports/:reportId/resolve', resolveViolationReport);
router.put('/violation-reports/:reportId', updateViolationReport);

// Hazard Report Routes
router.post('/hazard-reports', reportHazard);
router.get('/hazard-reports', getHazardReports);
router.put('/hazard-reports/:reportId/resolve', resolveHazardReport);
router.put('/hazard-reports/:reportId', updateHazardReport);

module.exports = router;