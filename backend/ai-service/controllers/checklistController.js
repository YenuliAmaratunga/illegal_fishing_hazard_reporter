const {
  MAX_BOAT_AGE_YEARS,
  MIN_FUEL_AMOUNT_LITERS,
  MIN_FUEL_EFFICIENCY,
  MIN_LIFE_JACKETS_PER_CREW,
  CRITICAL_ENGINE_STATUSES,
  RADIO_COMM_REQUIRED,
  WEATHER_CHECK_REQUIRED,
  MIN_FUEL_BUFFER_PERCENTAGE,
} = require('../riskConfig');

// Validation function
function validateChecklist(data) {
  const {
    boatAge,
    fuelAmount,
    fuelEfficiency,
    crewCount,
    lifeJacketsCount,
    engineStatus,
    hasRadioCommunication,
    weatherCheckCompleted,
    startingCoords,
    destinationCoords,
  } = data;

  // Basic validation
  if (boatAge > MAX_BOAT_AGE_YEARS) return false;
  if (fuelAmount < MIN_FUEL_AMOUNT_LITERS) return false;
  if (fuelEfficiency < MIN_FUEL_EFFICIENCY) return false;
  if (lifeJacketsCount < crewCount * MIN_LIFE_JACKETS_PER_CREW) return false;
  if (CRITICAL_ENGINE_STATUSES.includes(engineStatus)) return false;
  if (RADIO_COMM_REQUIRED && !hasRadioCommunication) return false;
  if (WEATHER_CHECK_REQUIRED && !weatherCheckCompleted) return false;

  // Optional: Calculate estimated fuel needed and compare buffer
  if (startingCoords && destinationCoords) {
    const estimatedDistance = calculateDistance(
      startingCoords.latitude,
      startingCoords.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );
    const estimatedFuelNeeded = estimatedDistance / fuelEfficiency;
    const requiredFuelWithBuffer = estimatedFuelNeeded * (1 + MIN_FUEL_BUFFER_PERCENTAGE);
    if (fuelAmount < requiredFuelWithBuffer) return false;
  }

  return true;
}

// Haversine formula to calculate distance in km between two coords
function calculateDistance(lat1, lon1, lat2, lon2) {
  function toRad(value) {
    return (value * Math.PI) / 180;
  }

  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to test validateChecklist() using hardcoded data
function testValidateChecklist() {
  const dummyChecklists = [
    {
      boatAge: 8,
      fuelAmount: 60,
      fuelEfficiency: 3.5,
      crewCount: 4,
      lifeJacketsCount: 4,
      engineStatus: 'Good',
      hasRadioCommunication: true,
      weatherCheckCompleted: true,
      startingCoords: { latitude: 37.7749, longitude: -122.4194 }, // SF
      destinationCoords: { latitude: 37.8044, longitude: -122.2711 }, // Oakland
    },
    {
      boatAge: 16, // too old
      fuelAmount: 60,
      fuelEfficiency: 3.5,
      crewCount: 4,
      lifeJacketsCount: 4,
      engineStatus: 'Good',
      hasRadioCommunication: true,
      weatherCheckCompleted: true,
      startingCoords: { latitude: 37.7749, longitude: -122.4194 },
      destinationCoords: { latitude: 34.0522, longitude: -118.2437 },
    },
    {
      boatAge: 5,
      fuelAmount: 15, // too little fuel
      fuelEfficiency: 3.5,
      crewCount: 4,
      lifeJacketsCount: 4,
      engineStatus: 'Good',
      hasRadioCommunication: true,
      weatherCheckCompleted: true,
      startingCoords: { latitude: 37.7749, longitude: -122.4194 },
      destinationCoords: { latitude: 34.0522, longitude: -118.2437 },
    },
    {
      boatAge: 5,
      fuelAmount: 60,
      fuelEfficiency: 3.5,
      crewCount: 4,
      lifeJacketsCount: 3, // not enough life jackets
      engineStatus: 'Good',
      hasRadioCommunication: true,
      weatherCheckCompleted: true,
      startingCoords: { latitude: 37.7749, longitude: -122.4194 },
      destinationCoords: { latitude: 34.0522, longitude: -118.2437 },
    },
    {
      boatAge: 5,
      fuelAmount: 60,
      fuelEfficiency: 3.5,
      crewCount: 4,
      lifeJacketsCount: 4,
      engineStatus: 'Critical', // critical engine
      hasRadioCommunication: true,
      weatherCheckCompleted: true,
      startingCoords: { latitude: 37.7749, longitude: -122.4194 },
      destinationCoords: { latitude: 34.0522, longitude: -118.2437 },
    },
  ];

  dummyChecklists.forEach((checklist, idx) => {
    const isValid = validateChecklist(checklist);
    console.log(`Test Case ${idx + 1}: ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);
  });
}


module.exports = {
  validateChecklist, testValidateChecklist,
};
