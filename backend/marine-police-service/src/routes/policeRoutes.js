const express = require('express');
const router = express.Router();
const { 
    createAlert,
    getActiveAlerts,
    resolveAlert,
    getViolationReports,
    verifyViolation,
    getHazardReports,
    resolveHazard,
    resolveAlertByBoat
} = require('../controllers/policeController');

// Alert Routes
router.get('/alerts', getActiveAlerts);
router.put('/alerts/:alertId/resolve', resolveAlert);
router.post("/create", createAlert);
router.put('/alerts/:boatId/resolve-by-boat', resolveAlertByBoat);

// Violation Report Routes (API calls to GPS service)
router.get('/violation-reports', getViolationReports);
router.put('/violation-reports/:reportId/verify', verifyViolation);

// Hazard Report Routes (API calls to GPS service)
router.get('/hazard-reports', getHazardReports);
router.put('/hazard-reports/:reportId/resolve', resolveHazard);

module.exports = router;