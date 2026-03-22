const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register user (ONLY ONCE)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if any user already exists in database
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Registration is closed. Only one registration allowed!'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user WITHOUT password hashing
    const user = await User.create({
      name,
      email,
      password: password // Direct password storage (no hash)
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email AND password (direct comparison)
    const user = await User.findOne({ 
      email: email,
      password: password // Direct password comparison
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if registration is allowed
// @route   GET /api/auth/check-registration
// @access  Public
const checkRegistration = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const isRegistrationOpen = userCount === 0;
    
    res.json({
      success: true,
      isRegistrationOpen,
      message: isRegistrationOpen ? 'Registration is open' : 'Registration is closed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  checkRegistration
};