const mongoose = require('mongoose');

async function check() {
  try {
    await mongoose.connect('mongodb+srv://rohitbarge22_db_user:qPcELD9pb9TMYCv2@cluster0.s2xku84.mongodb.net/transitnode?retryWrites=true&w=majority&appName=Cluster0');
    
    const ShipmentLedger = require('./src/models/NoSQL/ShipmentLedger');
    
    const activeShipment = await ShipmentLedger.findOne({
      'logistics.transport.driverPhone': '9878767983',
      status: { $in: ['READY_FOR_DISPATCH', 'IN_TRANSIT', 'ARRIVED'] }
    });

    console.log("Active Shipment Found:", !!activeShipment);
    if (activeShipment) {
      console.log(activeShipment);
    } else {
      console.log("Looking for ALL shipments assigned to 9878767983:");
      const all = await ShipmentLedger.find({ 'logistics.transport.driverPhone': '9878767983' });
      console.log(all);
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

check();
