const mongoose = require('mongoose');

const violationReportSchema = new mongoose.Schema({
    reporterId: String, // Could be boatId or public user ID
    boatId: {
        type: String,
        required: true
    },
    violationType: {
        type: String,
        required: true
    },
    description: String,
    evidence: {
        imageUrl: String,
        videoUrl: String
    },
    location: {
        latitude: Number,
        longitude: Number
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'dismissed'],
        default: 'pending'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ViolationReport', violationReportSchema);