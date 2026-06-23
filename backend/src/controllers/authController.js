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
      role: role || 'OPERATION_EXECUTIVE'
    });

    res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password, subdomain } = req.body;

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
      queryConditions.push({ username: email });
    }
    if (username) queryConditions.push({ username });

    const filter = { $or: queryConditions };

    // Strict Subdomain Security Check
    if (subdomain) {
      const Tenant = require('../models/NoSQL/Tenant');
      const tenant = await Tenant.findOne({ customSubdomain: subdomain });
      if (!tenant) {
        return res.status(401).json({ message: 'Invalid company portal URL' });
      }
      filter.tenantId = tenant._id;
    }

    const user = await User.findOne(filter);

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
      userId: user._id,
      role: user.role,
      tenantId: user.tenantId
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

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

exports.magicLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Magic link token is required' });
    }

    // Find user with this token and ensure it hasn't expired
    const user = await User.findOne({
      magicLinkToken: token,
      magicLinkExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({ message: 'Magic link is invalid or has expired' });
    }

    // Generate JWT
    const payload = {
      userId: user._id,
      role: user.role,
      tenantId: user.tenantId
    };
    
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Invalidate the token so it can't be used again
    user.magicLinkToken = undefined;
    user.magicLinkExpires = undefined;
    await user.save();

    res.status(200).json({
      message: 'Magic login successful',
      token: jwtToken,
      user: { id: user._id, email: user.email, username: user.username, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Error in magic login:', error);
    res.status(500).json({ message: 'Server error during magic login' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    let user = await User.findOne({ 
      $or: [{ mobileNumber }, { username: mobileNumber }, { email: `${mobileNumber}@transitnode.demo` }]
    });

    if (!user) {
      // Auto-migrate: Check if a Driver exists without a User account
      const Driver = require('../models/NoSQL/Driver');
      const driver = await Driver.findOne({ phone: mobileNumber });
      
      if (!driver) {
        return res.status(404).json({ message: 'User not found. Please contact admin to create your account.' });
      }

      // Create the missing User account for this driver
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(driver.licenseNumber || 'password123', salt);
      user = new User({
        tenantId: driver.tenantId,
        companyId: driver.companyId,
        name: driver.name,
        username: driver.phone,
        mobileNumber: driver.phone,
        email: `${driver.phone}@transitnode.demo`,
        password: hashedPassword,
        role: 'DRIVER'
      });
      await user.save();
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Save to user with 10 mins expiry
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log(`\n======================================================`);
    console.log(`[EXTERNAL SMS GATEWAY MOCK] Dispatching OTP...`);
    console.log(`To: ${mobileNumber}`);
    console.log(`Message: ${otp} is your TransitNode verification code. Valid for 10 minutes.`);
    console.log(`======================================================\n`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    const user = await User.findOne({ 
      $or: [{ mobileNumber }, { username: mobileNumber }, { email: `${mobileNumber}@transitnode.demo` }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otpCode || user.otpCode !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT
    const payload = {
      userId: user._id,
      role: user.role,
      tenantId: user.tenantId
    };
    
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'OTP verification successful',
      token: jwtToken,
      user: { id: user._id, email: user.email, username: user.username, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
};
