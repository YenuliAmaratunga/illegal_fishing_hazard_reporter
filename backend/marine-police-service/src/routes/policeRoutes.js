const express = require('express');
const router = express.Router();
const { 
    getActiveAlerts,
    resolveAlert,
    getViolationReports,
    verifyViolation,
    getHazardReports,
    resolveHazard
} = require('../controllers/policeController');

// Alert Routes
router.get('/alerts', getActiveAlerts);
router.put('/alerts/:alertId/resolve', resolveAlert);

// Violation Report Routes (API calls to GPS service)
router.get('/violation-reports', getViolationReports);
router.put('/violation-reports/:reportId/verify', verifyViolation);

// Hazard Report Routes (API calls to GPS service)
router.get('/hazard-reports', getHazardReports);
router.put('/hazard-reports/:reportId/resolve', resolveHazard);

module.exports = router;