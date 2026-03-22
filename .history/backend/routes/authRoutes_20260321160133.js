const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  checkRegistration
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/check-registration', checkRegistration);
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;