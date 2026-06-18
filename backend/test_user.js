const mongoose = require('mongoose');

async function checkUser() {
  try {
    await mongoose.connect('mongodb+srv://rohitbarge22_db_user:qPcELD9pb9TMYCv2@cluster0.s2xku84.mongodb.net/transitnode?retryWrites=true&w=majority&appName=Cluster0');
    
    const User = require('./src/models/NoSQL/User');
    const user = await User.findOne({ mobileNumber: '9878767983' });
    console.log("User by mobileNumber:", user);
    
    const userByUsername = await User.findOne({ username: '9878767983' });
    console.log("User by username:", userByUsername);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

checkUser();
