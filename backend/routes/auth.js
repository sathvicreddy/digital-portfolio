const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// @route   POST api/auth/login
// @desc    Authenticate admin and get token
// @access  Public
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Ensure env variables are configured
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
      console.error('Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, or JWT_SECRET');
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    // Check against env variables
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const payload = {
        user: {
          id: 'admin_id_1',
          role: 'admin'
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '10h' },
        (err, token) => {
          if (err) {
            console.error('JWT signing error:', err.message);
            return res.status(500).json({ msg: 'Failed to generate authentication token' });
          }
          res.json({ token, msg: 'Login successful' });
        }
      );
    } else {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

module.exports = router;
