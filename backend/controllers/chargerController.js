// Get all chargers
exports.getChargers = async (req, res) => {
  try {
    let chargers;

    // Admin can see all chargers
    if (req.user.role === 'admin') {
      chargers = await Charger.findAll(); // All chargers
    } else {
      chargers = await Charger.findAll({
        where: { UserId: req.user.id } // Only user's chargers
      });
    }

    res.json(chargers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chargers', error: error.message });
  }
};

// Update charger
exports.updateCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Only allow if user owns it or admin
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

// Delete charger
exports.deleteCharger = async (req, res) => {
  try {
    const charger = await Charger.findByPk(req.params.id);
    if (!charger) {
      return res.status(404).json({ message: 'Charger not found' });
    }

    // Only allow if user owns it or admin
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
