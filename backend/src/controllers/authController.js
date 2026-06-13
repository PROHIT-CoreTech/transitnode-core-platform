const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/NoSQL/User');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role, mobileNumber } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { mobileNumber: mobileNumber || '---' }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or mobile number already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = await User.create({
      email,
      mobileNumber,
      password: hashedPassword,
      name,
      role: role || 'RECEPTIONIST'
    });

    res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (!email && !username) {
      return res.status(400).json({ message: 'Email, Username or Mobile Number is required' });
    }

    // Fetch user by email, username, or mobileNumber
    // We assume 'email' could also contain a mobile number if the user typed it in the email field.
    const queryConditions = [];
    if (email) {
      queryConditions.push({ email });
      queryConditions.push({ mobileNumber: email });
    }
    if (username) queryConditions.push({ username });

    const user = await User.findOne({ $or: queryConditions });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      id: user._id,
      role: user.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, username: user.username, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
