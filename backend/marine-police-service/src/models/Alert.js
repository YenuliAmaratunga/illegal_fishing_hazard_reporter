const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    boatId: {
        type: String,
        required: true
    },
    alertType: {
        type: String,
        enum: ['sos', 'restricted_zone', 'late_return'],
        required: true
    },
    location: {
        latitude: Number,
        longitude: Number
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);