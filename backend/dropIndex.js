require('dotenv').config();
const mongoose = require('mongoose');

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const RateCard = require('./src/models/NoSQL/RateCard');
    await RateCard.collection.dropIndex('type_1');
    console.log('Index dropped successfully');
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('Index already dropped or does not exist');
    } else {
      console.error('Error dropping index:', error);
    }
  } finally {
    await mongoose.disconnect();
  }
}

dropIndex();
