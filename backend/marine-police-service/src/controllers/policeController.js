const Alert = require('../models/Alert');
const axios = require('axios');

// GPS Service base URL
//const GPS_SERVICE_URL = 'http://localhost:5001/api/gps';
const { GPS_BASE } = require('../config/urls');

// ALERTS (SOS, restricted zones, etc.)
exports.createAlert = async (req, res) => {
  try {
    const body = req.body;

    // accept both payload shapes
    const alertType = body.alertType || (body.type ? String(body.type).toLowerCase() : undefined) || 'sos';
    const location = body.location || (
      (typeof body.latitude === 'number' && typeof body.longitude === 'number')
        ? { latitude: body.latitude, longitude: body.longitude }
        : undefined
    );

    const alert = new Alert({
      alertType,
      boatId: body.boatId,
      location,
      description: body.message,
      status: body.status || 'active',
    });

    await alert.save(); // FIX: actually save

    return res.status(201).json({ success: true, data: alert }); // FIX: respond
  } catch (err) {
    console.error('[police] Error creating alert:', err);
    return res.status(500).json({ success: false, message: 'Failed to create alert' });
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
        const response = await axios.get(`${GPS_BASE}/api/reports/violation-reports`);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching violation reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch violation reports' });
    }
};

exports.verifyViolation = async (req, res) => {
    try {
        const { reportId } = req.params;
        const response = await axios.put(`${GPS_BASE}/api/reports/violation-reports/${reportId}/verify`);
        res.json({ success: true, message: 'Violation verified successfully', data: response.data });
    } catch (error) {
        console.error('Error verifying violation:', error);
        res.status(500).json({ success: false, message: 'Failed to verify violation' });
    }
};

// HAZARD REPORTS (via API calls to GPS service)

exports.getHazardReports = async (req, res) => {
    try {
        const response = await axios.get(`${GPS_BASE}/api/reports/hazard-reports`);
        res.json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error fetching hazard reports:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch hazard reports' });
    }
};

exports.resolveHazard = async (req, res) => {
    try {
        const { reportId } = req.params;
        const response = await axios.put(`${GPS_BASE}/api/reports/hazard-reports/${reportId}/resolve`);
        res.json({ success: true, message: 'Hazard resolved successfully', data: response.data });
    } catch (error) {
        console.error('Error resolving hazard:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve hazard' });
    }
};

exports.resolveAlertByBoat = async (req, res) => {
  try {
    const { boatId } = req.params;
    const { reason, latitude, longitude } = req.body || {};

    const open = await Alert.findOne({ boatId, alertType: 'sos', status: 'active' }).sort({ timestamp: -1 });
    if (!open) {
      return res.json({ success: true, message: 'No active SOS for this boat' });
    }

    open.status = 'resolved';
    if (latitude != null && longitude != null) {
      open.location = { latitude, longitude };
    }
    if (reason) open.description = `${open.description || ''} [resolved: ${reason}]`;
    await open.save();

    return res.json({ success: true, message: 'Alert resolved', data: open });
  } catch (e) {
    console.error('resolveAlertByBoat error:', e);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
