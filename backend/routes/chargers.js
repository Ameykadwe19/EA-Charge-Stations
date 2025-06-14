const { protect, authorize } = require('../middleware/auth');

router.use(protect);  // All routes need login

router.route('/')
  .get(getChargers)
  .post(createCharger); // All users can create

router.route('/:id')
  .get(getCharger)
  .put(updateCharger)
  .delete(deleteCharger); // We’ll restrict in controller (based on role + ownership)

