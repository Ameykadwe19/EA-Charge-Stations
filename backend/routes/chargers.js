const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getChargers,
  getCharger,
  createCharger,
  updateCharger,
  deleteCharger
} = require('../controllers/chargerController');

// Protected routes (need authentication but no specific role)
router.use(protect);  // All routes below this will require authentication

router.route('/')
  .get(getChargers)
  .post(createCharger);

router.route('/:id')
  .get(getCharger)
  .put(updateCharger)
  .delete(deleteCharger);

module.exports = router; 
