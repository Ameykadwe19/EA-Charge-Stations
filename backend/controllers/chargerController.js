const { Charger } = require('../models');

// ✅ Get all chargers — Admin: all, User: only own
exports.getChargers = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { UserId: req.user.id };
    const chargers = await Charger.findAll({ where });
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chargers', error: error.message });
  }
};

// ✅ Get single charger — Everyone
exports.getCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // User can only see their own
    if (req.user.role !== 'admin' && charger.UserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this charger' });
    }

    res.json(charger);
  } catch (error) {
    console.error('Get charger error:', error);
    res.status(500).json({ message: 'Error fetching charger' });
  }
};

// ✅ Create charger — only for current logged-in user
exports.createCharger = async (req, res) => {
  try {
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

// ✅ Update charger — Admin: all, User: only own
exports.updateCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Check permission
    if (req.user.role !== 'admin' && charger.UserId !== req.user.id) {
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

// ✅ Delete charger — Admin: all, User: only own
exports.deleteCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    if (req.user.role !== 'admin' && charger.UserId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this charger' });
    }

    await charger.destroy();
    res.json({ message: 'Charger deleted successfully' });
  } catch (error) {
    console.error('Delete charger error:', error);
    res.status(500).json({ message: 'Error deleting charger' });
  }
};

// ✅ Public: Get nearby chargers — only shows active ones
exports.getNearbyChargers = async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query; // radius in km

    const chargers = await Charger.findAll({
      where: {
        status: 'active'
      }
    });

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

// 🔧 Haversine Distance Calculation
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius (km)
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
