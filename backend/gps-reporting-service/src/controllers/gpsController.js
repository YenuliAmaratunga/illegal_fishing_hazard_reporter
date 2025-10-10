const BoatLocation = require('../models/BoatLocation');
const axios = require("axios");
const POLICE_SERVICE_URL = "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatch/marine-police-service/v1.0/api/alerts";

// Update boat location (called from fisherman app)
exports.updateLocation = async (req, res) => {
    try {
        const { boatId, latitude, longitude } = req.body;

        // Basic validation
        if (!boatId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'BoatId, latitude and longitude are required' 
            });
        }

        // Create new location record
        const newLocation = new BoatLocation({
            boatId,
            latitude,
            longitude,
            status: 'active'
        });

        await newLocation.save();

        res.status(201).json({
            success: true,
            message: 'Location updated successfully',
            data: newLocation
        });

    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

// Send SOS alert
exports.sendSOS = async (req, res) => {
    try {
        const { boatId, latitude, longitude } = req.body;

        if (!boatId) {
            return res.status(400).json({ 
                success: false, 
                message: 'BoatId is required' 
            });
        }

        // Create SOS location record
        const sosLocation = new BoatLocation({
            boatId,
            latitude: latitude || 0, // Use provided coords or default
            longitude: longitude || 0,
            status: 'sos'
        });

        await sosLocation.save();

         try {
      await axios.post(`${POLICE_SERVICE_URL}/create`, {
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
      console.error("⚠️ Failed to send alert to police:", notifyErr.message);
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
                $sort: { timestamp: -1 } // Sort by newest first
            },
            {
                $group: {
                    _id: "$boatId", // Group by boatId
                    latestLocation: { $first: "$$ROOT" } // Take the first (newest) document for each boat
                }
            }
        ]);

        res.json({
            success: true,
            data: latestLocations
        });

    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};