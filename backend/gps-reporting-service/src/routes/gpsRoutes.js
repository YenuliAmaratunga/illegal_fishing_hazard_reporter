const express = require('express');
const router = express.Router();
const { 
    updateLocation, 
    sendSOS, 
    getLatestLocations,
    cancelSOS,
    getLatestBoatStatuses
} = require('../controllers/gpsController');

// GPS Tracking Routes
router.post('/location', updateLocation);
router.post('/update-location', updateLocation); 
router.post('/sos', sendSOS);
router.get('/locations', getLatestLocations);
router.post('/sos/cancel', cancelSOS);           
router.get('/latest-statuses', getLatestBoatStatuses);

module.exports = router;