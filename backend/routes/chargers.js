const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin'); // <-- Add this line
const {
  getChargers,
  getCharger,
  createCharger,
  updateCharger,
  deleteCharger,
  getAllChargersForAdmin 
} = require('../controllers/chargerController');

router.use(protect); // All routes below need login

//  Admin-only route to get all chargers
router.get('/admin/all', isAdmin, getAllChargersForAdmin);  

// User routes
router.route('/')
  .get(getChargers)
  .post(createCharger);

router.route('/:id')
  .get(getCharger)
  .put(updateCharger)
  .delete(deleteCharger);

module.exports = router;
