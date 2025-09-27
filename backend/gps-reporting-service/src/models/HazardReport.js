const mongoose = require('mongoose');

const hazardReportSchema = new mongoose.Schema({
    reporterId: String, // Could be boatId or public user ID
    hazardType: {
        type: String,
        enum: ['debris', 'oil_spill', 'weather', 'navigation_hazard', 'other'],
        required: true
    },
    description: String,
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    evidence: {
        imageUrl: String,
        videoUrl: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'resolved'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('HazardReport', hazardReportSchema);