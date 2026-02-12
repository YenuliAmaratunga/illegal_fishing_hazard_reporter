const ViolationReport = require('../models/ViolationReport');
const HazardReport = require('../models/HazardReport');

// VIOLATION REPORTS

// Create illegal fishing report
exports.reportViolation = async (req, res) => {
    try {
        const { boatId, violationType, description, evidence, location } = req.body;

        if (!boatId || !violationType) {
            return res.status(400).json({ 
                success: false, 
                message: 'BoatId and violation type are required' 
            });
        }

        const newReport = new ViolationReport({
            boatId,
            violationType,
            description,
            evidence,
            location,
            status: 'pending'
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: 'Violation report submitted successfully',
            data: newReport
        });

    } catch (error) {
        console.error('Error creating violation report:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get all violation reports
exports.getViolationReports = async (req, res) => {
    try {
        const reports = await ViolationReport.find().sort({ timestamp: -1 });
        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('Error fetching violation reports:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Verify a violation report
exports.verifyViolationReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await ViolationReport.findByIdAndUpdate(
            reportId,
            { status: 'verified' },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ 
                success: false, 
                message: 'Report not found' 
            });
        }

        res.json({
            success: true,
            message: 'Violation verified successfully',
            data: report
        });

    } catch (error) {
        console.error('Error verifying violation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// HAZARD REPORTS

// Create hazard report
exports.reportHazard = async (req, res) => {
    try {
        const { reporterId, hazardType, description, location, severity, evidence } = req.body;

        if (!hazardType || !location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Hazard type and location are required' 
            });
        }

        const hazardReport = new HazardReport({
            reporterId,
            hazardType,
            description,
            location,
            severity: severity || 'medium',
            evidence,
            status: 'pending'
        });

        await hazardReport.save();

        res.status(201).json({
            success: true,
            message: 'Hazard report submitted successfully',
            data: hazardReport
        });

    } catch (error) {
        console.error('Error creating hazard report:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Get all hazard reports
exports.getHazardReports = async (req, res) => {
    try {
        const hazards = await HazardReport.find().sort({ timestamp: -1 });
        res.json({
            success: true,
            data: hazards
        });
    } catch (error) {
        console.error('Error fetching hazard reports:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Resolve hazard report
exports.resolveHazardReport = async (req, res) => {
    try {
        const { reportId } = req.params;

        const hazard = await HazardReport.findByIdAndUpdate(
            reportId,
            { status: 'resolved' },
            { new: true }
        );

        if (!hazard) {
            return res.status(404).json({ 
                success: false, 
                message: 'Hazard report not found' 
            });
        }

        res.json({
            success: true,
            message: 'Hazard report resolved successfully',
            data: hazard
        });

    } catch (error) {
        console.error('Error resolving hazard:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

exports.resolveViolationReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await ViolationReport.findByIdAndUpdate(
      reportId,
      { status: 'resolved' },
      { new: true }
    );
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Violation resolved', data: report });
  } catch (e) {
    console.error('Error resolving violation:', e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// GET /api/reports/my?reporterId=123
exports.getMyReports = async (req, res) => {
  try {
    const { reporterId } = req.query;
    if (!reporterId) {
      return res.status(400).json({ success: false, message: "reporterId is required" });
    }

    // find by boatId or reporterId across both collections
    const violations = await ViolationReport.find({
      $or: [{ boatId: reporterId }, { reporterId }],
    }).sort({ timestamp: -1 });

    const hazards = await HazardReport.find({
      $or: [{ boatId: reporterId }, { reporterId }],
    }).sort({ timestamp: -1 });

    const combined = [...violations, ...hazards].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({ success: true, data: combined });
  } catch (err) {
    console.error("Error fetching my reports:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//PUT /api/reports/violation-reports/:reportId
exports.updateViolationReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Only allow these fields to be updated
    const {
      reporterId,
      boatId,
      violationType,
      description,
      location,      // { latitude, longitude }
      evidence,      // { imageUrl: string[], videoUrl: string[] }
      status,        // 'pending' | 'verified' | 'resolved'
    } = req.body || {};

    const update = {
      ...(reporterId !== undefined && { reporterId }),
      ...(boatId !== undefined && { boatId }),
      ...(violationType !== undefined && { violationType }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(evidence !== undefined && { evidence }),
      ...(status !== undefined && { status }),
    };

    const updated = await ViolationReport.findByIdAndUpdate(
      reportId,
      update,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Violation report not found' });
    }

    return res.json({ success: true, message: 'Violation report updated', data: updated });
  } catch (err) {
    console.error('updateViolationReport error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//PUT /api/reports/hazard-reports/:reportId
exports.updateHazardReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const {
      reporterId,
      hazardType,    // 'debris' | 'oil spill' | 'weather' | 'navigation hazard' | 'other'
      description,
      location,      // { latitude, longitude }
      severity,      // 'low' | 'medium' | 'high' | 'critical'
      evidence,      // { imageUrl: string[], videoUrl: string[] }
      status,        // 'pending' | 'resolved'
    } = req.body || {};

    const update = {
      ...(reporterId !== undefined && { reporterId }),
      ...(hazardType !== undefined && { hazardType }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(severity !== undefined && { severity }),
      ...(evidence !== undefined && { evidence }),
      ...(status !== undefined && { status }),
    };

    const updated = await HazardReport.findByIdAndUpdate(
      reportId,
      update,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Hazard report not found' });
    }

    return res.json({ success: true, message: 'Hazard report updated', data: updated });
  } catch (err) {
    console.error('updateHazardReport error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};