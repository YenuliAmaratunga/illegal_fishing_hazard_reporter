const Trip = require('../models/TripSchema');
const User = require('../models/UserSchema');
const Boat = require('../models/BoatSchema');

exports.registerTrip = async (req, res) => {
  try {
    const { boat, numberOfParticipants, participantIds: participantNationalIds, startingLocation, heading } = req.body;
    const errors = [];

    // Validate required fields
    if (!boat || !numberOfParticipants || !participantNationalIds || !startingLocation || heading === undefined) {
      errors.push("Missing required fields");
    }

    if (participantNationalIds && participantNationalIds.length !== numberOfParticipants) {
      errors.push("Number of participants does not match number of IDs");
    }

    // Verify participants by nationalId
    let participantObjectIds = [];
    if (participantNationalIds && participantNationalIds.length > 0) {
      const users = await User.find({ nationalId: { $in: participantNationalIds } });
      if (users.length !== participantNationalIds.length) {
        errors.push("One or more participant national IDs are invalid or not registered");
      } else {
        participantObjectIds = users.map(user => user._id);
      }
    }

    // Verify boat
    const existingBoat = await Boat.findById(boat);
    if (!existingBoat) {
      errors.push("Boat is not registered in the system");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // Save trip
    const newTrip = new Trip({
      fishermanId: req.user.id,
      boat,
      numberOfParticipants,
      participantIds: participantObjectIds,
      startingLocation,
      heading,
    });

    const savedTrip = await newTrip.save();

    return res.status(201).json({
      message: "Fishing trip registered successfully",
      trip: savedTrip,
    });

  } catch (error) {
    console.error("Error registering trip:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
