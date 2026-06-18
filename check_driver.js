const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb+srv://rohitbarge22_db_user:qPcELD9pb9TMYCv2@cluster0.s2xku84.mongodb.net/transitnode?retryWrites=true&w=majority&appName=Cluster0');
    
    const User = require('./backend/src/models/NoSQL/User');
    const Driver = require('./backend/src/models/NoSQL/Driver');

    const user = await User.findOne({ username: '9878767983' });
    console.log('User found:', !!user);
    if (user) {
      console.log('User Role:', user.role);
      console.log('User password hash:', user.password);
    }
    
    const driver = await Driver.findOne({ phone: '9878767983' });
    console.log('Driver found:', !!driver);
    if (driver) {
      console.log('Driver Name:', driver.name);
      console.log('Driver License:', driver.licenseNumber);
    }

    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
