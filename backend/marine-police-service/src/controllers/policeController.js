const Alert = require('../models/Alert');
const axios = require('axios');

// GPS Service base URL
const GPS_SERVICE_URL = 'http://localhost:5001/api/gps';

// ALERTS (SOS, restricted zones, etc.)
exports.createAlert = async (req, res) => {
  try {
    const { type, boatId, latitude, longitude, message, status } = req.body;
    const alert = new Alert({
      type,
      boatId,
      latitude,
      longitude,
      message,
      status: status || "active",
    });
    await alert.save();
    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    console.error("Error creating alert:", err);
    res.status(500).json({ success: false, message: "Failed to create alert" });
  }
};

exports.getActiveAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: 'active' }).sort({ timestamp: -1 });
        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.resolveAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        const alert = await Alert.findByIdAndUpdate(
            alertId,
            { status: 'resolved' },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        res.json({ success: true, message: 'Alert resolved successfully', data: alert });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// VIOLATION REPORTS (via API calls to GPS service)

exports.getViolationReports = async (req, res) => {
    try {
        const response = await axios.get(`${GPS_SERVICE_URL}/violation-reports`);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching violation reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch violation reports' });
    }
};

exports.verifyViolation = async (req, res) => {
    try {
        const { reportId } = req.params;
        const response = await axios.put(`${GPS_SERVICE_URL}/violation-reports/${reportId}/verify`);
        res.json({ success: true, message: 'Violation verified successfully', data: response.data });
    } catch (error) {
        console.error('Error verifying violation:', error);
        res.status(500).json({ success: false, message: 'Failed to verify violation' });
    }
};

// HAZARD REPORTS (via API calls to GPS service)

exports.getHazardReports = async (req, res) => {
    try {
        const response = await axios.get(`${GPS_SERVICE_URL}/hazard-reports`);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching hazard reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch hazard reports' });
    }
};

exports.resolveHazard = async (req, res) => {
    try {
        const { reportId } = req.params;
        const response = await axios.put(`${GPS_SERVICE_URL}/hazard-reports/${reportId}/resolve`);
        res.json({ success: true, message: 'Hazard resolved successfully', data: response.data });
    } catch (error) {
        console.error('Error resolving hazard:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve hazard' });
    }
};