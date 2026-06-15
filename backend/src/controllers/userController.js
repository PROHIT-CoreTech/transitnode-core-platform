const User = require('../models/NoSQL/User');
const bcrypt = require('bcrypt');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId }, '-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, tenantId: req.user.tenantId }, '-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, username, mobileNumber, password } = req.body;
    
    const user = await User.findOne({ _id: id, tenantId: req.user.tenantId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email) user.email = email;
    if (name) user.name = name;
    if (role) user.role = role;
    if (username) user.username = username;
    if (mobileNumber) user.mobileNumber = mobileNumber;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({ 
      message: 'User updated successfully', 
      user: { id: user._id, email: user.email, name: user.name, role: user.role, username: user.username, mobileNumber: user.mobileNumber } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id, tenantId: req.user.tenantId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// POST /api/users/setup-admin
exports.setupAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = req.user.userId; // Provided by authGuard

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only ADMIN can perform initial setup' });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.username = username;
    user.password = hashedPassword;
    await user.save();

    // Mark Tenant as setup complete
    const Tenant = require('../models/NoSQL/Tenant');
    await Tenant.findByIdAndUpdate(user.tenantId, { adminSetupComplete: true });

    res.status(200).json({ message: 'Admin credentials configured successfully' });
  } catch (error) {
    console.error('Error in setupAdmin:', error);
    res.status(500).json({ message: 'Server error during admin setup' });
  }
};
