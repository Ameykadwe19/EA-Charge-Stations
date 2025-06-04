const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const chargerController = require('../controllers/chargerController');

router.get('/', auth, chargerController.getAll);
router.post('/', auth, chargerController.create);
router.put('/:id', auth, chargerController.update);
router.delete('/:id', auth, chargerController.remove);

module.exports = router;
