const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Tenant = require('../src/models/NoSQL/Tenant');
const User = require('../src/models/NoSQL/User');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const subdomainsToDelete = ['rohit', 'emirates'];
    const mobileNumbersToDelete = ['9561042069', '9876543210'];

    for (const sub of subdomainsToDelete) {
      const resT = await Tenant.deleteMany({ customSubdomain: sub });
      console.log(`Deleted tenants for subdomain "${sub}":`, resT.deletedCount);
    }

    for (const mob of mobileNumbersToDelete) {
      const resU = await User.deleteMany({ username: mob });
      const resU2 = await User.deleteMany({ mobileNumber: mob });
      console.log(`Deleted users for mobile "${mob}":`, resU.deletedCount + resU2.deletedCount);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
