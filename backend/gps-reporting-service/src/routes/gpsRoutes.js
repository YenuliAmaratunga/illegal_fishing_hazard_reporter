const express = require('express');
const router = express.Router();
const { 
    updateLocation, 
    sendSOS, 
    getLatestLocations 
} = require('../controllers/gpsController');

// GPS Tracking Routes
router.post('/location', updateLocation);
router.post('/sos', sendSOS);
router.get('/locations', getLatestLocations);

module.exports = router;