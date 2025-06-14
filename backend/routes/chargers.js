const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getChargers,
  getCharger,
  createCharger,
  updateCharger,
  deleteCharger
} = require('../controllers/chargerController'); 

const router = express.Router();

router.use(protect); // All routes require login

router.route('/')
  .get(getChargers)         
  .post(createCharger);     

router.route('/:id')
  .get(getCharger)         
  .put(updateCharger)      
  .delete(deleteCharger);   

module.exports = router; 
