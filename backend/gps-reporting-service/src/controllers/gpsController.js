const BoatLocation = require("../models/BoatLocation");
const axios = require("axios");
const { POLICE_BASE } = require("../config/urls");
const POLICE_ALERTS_URL = `${POLICE_BASE}/api/police/alerts`;
const POLICE_CREATE_URL = `${POLICE_BASE}/api/police/create`;

// ADDED helper – finds latest SOS for a boatId (nationalId) that’s still open
const hasOpenSOS = async (boatId) => {
  const latest = await BoatLocation.findOne({ boatId })
    .sort({ timestamp: -1 })
    .lean();
  // Treat the SOS session as "open" if the latest record’s status is 'sos'
  return latest?.status === "sos";
};

// Update boat location (called from fisherman app)
exports.updateLocation = async (req, res) => {
  try {
    // FIX: destructure first
    const { boatId, latitude, longitude } = req.body;

    if (!boatId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "BoatId, latitude and longitude are required",
      });
    }

    // ADDED: keep SOS sticky while open
    const open = await hasOpenSOS(boatId);
    const effectiveStatus = open ? "sos" : "active";

    // FIX: single newLocation (remove the duplicate you had)
    const newLocation = new BoatLocation({
      boatId,
      latitude,
      longitude,
      status: effectiveStatus,
    });

    await newLocation.save();

    res.status(201).json({
      success: true,
      message: "Location updated successfully",
      data: newLocation,
    });
  } catch (error) {
    console.error("[gps] Error updating location:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Send SOS alert
exports.sendSOS = async (req, res) => {
  try {
    const { boatId, latitude, longitude } = req.body;

    if (!boatId) {
      return res.status(400).json({
        success: false,
        message: "BoatId is required",
      });
    }

    // Create SOS location record
    const sosLocation = new BoatLocation({
      boatId,
      latitude: latitude || 0, // Use provided coords or default
      longitude: longitude || 0,
      status: "sos",
    });

    await sosLocation.save();

    try {
      await axios.post(POLICE_CREATE_URL, {
        type: "SOS",
        boatId,
        latitude,
        longitude,
        status: "active",
        message: `SOS from ${boatId}`,
        timestamp: new Date(),
      });
      console.log("✅ Sent SOS alert to Marine Police");
    } catch (notifyErr) {
      console.error(
        "⚠️ Failed to send alert to police:",
        notifyErr.response?.data || notifyErr.message
      );
    }

    return res.status(201).json({
      success: true,
      message: "SOS alert sent successfully",
      data: sosLocation,
    });
  } catch (error) {
    console.error("Error sending SOS:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get latest locations of all boats (for police dashboard)
exports.getLatestLocations = async (req, res) => {
  try {
    // This gets the most recent location for each boat
    const latestLocations = await BoatLocation.aggregate([
      {
        $sort: { timestamp: -1 }, // Sort by newest first
      },
      {
        $group: {
          _id: "$boatId", // Group by boatId
          latestLocation: { $first: "$$ROOT" }, // Take the first (newest) document for each boat
        },
      },
    ]);

    res.json({
      success: true,
      data: latestLocations,
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ADDED: Fisherman cancels current SOS
exports.cancelSOS = async (req, res) => {
  try {
    const { boatId, latitude, longitude } = req.body; // boatId is nationalId
    if (!boatId) {
      return res
        .status(400)
        .json({ success: false, message: "BoatId (nationalId) is required" });
    }

    // Write a fresh location entry with status 'active' to mark SOS closed
    const cancelEntry = new BoatLocation({
      boatId,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      status: "active",
    });
    await cancelEntry.save();

    // Optional: notify police the SOS is cleared (create a resolved alert)
    try {
      await axios.put(`${POLICE_ALERTS_URL}/${boatId}/resolve-by-boat`, {
        boatId,
        latitude,
        longitude,
        reason: "cancelled_by_fisherman",
        timestamp: new Date(),
      });
      console.log(`[gps] notified police: cancel SOS by ${boatId}`);
    } catch (notifyErr) {
      console.error(
        "[gps] police notify failed on cancel:",
        notifyErr?.message
      );
    }

    return res.json({
      success: true,
      message: "SOS canceled",
      data: cancelEntry,
    });
  } catch (error) {
    console.error("Error canceling SOS:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ADDED: return latest record per boatId
exports.getLatestBoatStatuses = async (req, res) => {
  try {
    const latest = await BoatLocation.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: { _id: "$boatId", latest: { $first: "$$ROOT" } } },
    ]);
    return res.json({ success: true, data: latest });
  } catch (e) {
    console.error("Error getLatestBoatStatuses:", e);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
