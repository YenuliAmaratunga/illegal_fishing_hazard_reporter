const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
    boatType: { type: String, required: true },
    fuelAmount: { type: Number, required: true },
    lifeJacketsCount: { type: Number, required: true },
    boatAge: { type: Number, required: true },
    tripDate: { type: Date, required: true },
    crewCount: { type: Number, required: true },
    startingLocation: { type: String, required: true },
    startingCoords: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    destinationCoords: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    hasRadioCommunication: { type: Boolean, required: true },
    engineStatus: { type: String, enum: ['Good', 'Needs Maintenance', 'Critical'], required: true },
    fuelEfficiency: { type: Number, required: true },
    weatherCheckCompleted: { type: Boolean, required: true },
    riskScore: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
});

module.exports = mongoose.model('Checklist', checklistSchema);