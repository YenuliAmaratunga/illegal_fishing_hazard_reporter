const mongoose = require('mongoose');

const boatLocationSchema = new mongoose.Schema({
    boatId: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'sos', 'returned'],
        default: 'active'
    }
});

// Create index for faster queries by boatId and timestamp
boatLocationSchema.index({ boatId: 1, timestamp: -1 });

module.exports = mongoose.model('BoatLocation', boatLocationSchema);