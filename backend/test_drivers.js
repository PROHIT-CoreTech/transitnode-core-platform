const jwt = require('jsonwebtoken');
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/NoSQL/User');

async function test() {
  await mongoose.connect('mongodb+srv://rohitbarge22_db_user:qPcELD9pb9TMYCv2@cluster0.s2xku84.mongodb.net/transitnode?retryWrites=true&w=majority&appName=Cluster0');
  
  const user = await User.findOne({ email: 'admin@sarthak.com' });
  if (!user) {
    console.log("Admin user not found");
    process.exit(1);
  }

  const token = jwt.sign({ userId: user._id, role: user.role, tenantId: user.tenantId }, process.env.JWT_SECRET || 'transitnode_secret_key', { expiresIn: '1h' });

  try {
    const res = await axios.get('http://localhost:3000/api/admin/drivers', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.log("Error:", err.response ? err.response.status : err.message);
    if (err.response) {
      console.log("Data:", err.response.data);
    }
  }
  process.exit(0);
}

test();
