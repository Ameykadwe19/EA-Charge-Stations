const { Charger } = require('../models');

// Get all chargers
exports.getChargers = async (req, res) => {
  try {
    // Sirf login user ke chargers laane ke liye
    const chargers = await Charger.findAll({
      where: { UserId: req.user.id }
    });
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chargers', error: error.message });
  }
};

// Get single charger
exports.getCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }
    res.json(charger);
  } catch (error) {
    console.error('Get charger error:', error);
    res.status(500).json({ message: 'Error fetching charger' });
  }
};

// Create charger
exports.createCharger = async (req, res) => {
  try {
    console.log('Creating charger with data:', { ...req.body, UserId: req.user.id });
    const charger = await Charger.create({
      ...req.body,
      UserId: req.user.id
    });
    res.status(201).json(charger);
  } catch (error) {
    console.error('Create charger error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Error creating charger',
      error: error.message
    });
  }
};

// Update charger
exports.updateCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }
    // Only allow if the user owns the charger
    if (charger.UserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this charger' });
    }

    await charger.update(req.body);
    res.json(charger);
  } catch (error) {
    console.error('Update charger error:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating charger' });
  }
};

// Delete charger
exports.deleteCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Check ownership
    if (charger.UserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this charger' });
    }

    await charger.destroy();
    res.json({ message: 'Charger deleted successfully' });
  } catch (error) {
    console.error('Delete charger error:', error);
    res.status(500).json({ message: 'Error deleting charger' });
  }
};

// Get nearby chargers
exports.getNearbyChargers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in kilometers

    const chargers = await Charger.findAll({
      where: {
        status: 'active'
      }
    });

    // Filter chargers within radius using Haversine formula
    const nearbyChargers = chargers.filter(charger => {
      const distance = getDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(charger.latitude),
        parseFloat(charger.longitude)
      );
      return distance <= radius;
    });

    res.json(nearbyChargers);
  } catch (error) {
    console.error('Get nearby chargers error:', error);
    res.status(500).json({ message: 'Error fetching nearby chargers' });
  }
};

// Helper function to calculate distance using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return (value * Math.PI) / 180;
} 
