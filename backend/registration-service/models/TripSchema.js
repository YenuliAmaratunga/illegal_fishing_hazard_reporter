const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  fishermanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  boat: { type: mongoose.Schema.Types.ObjectId, ref: 'Boat', required: true },
  numberOfParticipants: { type: Number, required: true },
  participantIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    
  }],
  
 
  startingLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  heading: { type: Number, required: true },
});

module.exports = mongoose.model("Trip", TripSchema);
