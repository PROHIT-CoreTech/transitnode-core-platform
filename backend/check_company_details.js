const mongoose = require('mongoose');
const Company = require('./src/models/NoSQL/Company');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const companies = await Company.find({}).lean();
  console.log(JSON.stringify(companies.map(c => ({ name: c.companyName, template: c.invoiceTemplateType, address: c.address })), null, 2));
  process.exit(0);
}
run();
