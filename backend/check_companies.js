const mongoose = require('mongoose');
const Company = require('./src/models/NoSQL/Company');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/transitnode', { useNewUrlParser: true, useUnifiedTopology: true });
  const companies = await Company.find({}).lean();
  console.log(companies.map(c => c.companyName));
  process.exit(0);
}
run();
