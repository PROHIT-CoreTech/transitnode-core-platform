const Payroll = require('../models/NoSQL/Payroll');
const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');

exports.calculatePayroll = async (req, res) => {
  const { month } = req.query; // e.g., "2026-05"
  
  if (!month) {
    return res.status(400).json({ success: false, message: 'Month is required (YYYY-MM)' });
  }

  try {
    // 1. Find all driver advances for the given month from ShipmentLedger
    // We'll use the month string to match against metadata.createdAt
    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const driverAdvances = await ShipmentLedger.aggregate([
      {
        $match: {
          'metadata.createdAt': { $gte: startDate, $lt: endDate },
          'accounting.driverAdvanceCash': { $gt: 0 },
          'logistics.transport.driverName': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: {
            name: '$logistics.transport.driverName',
            phone: '$logistics.transport.driverPhone'
          },
          totalAdvance: { $sum: '$accounting.driverAdvanceCash' }
        }
      }
    ]);

    // In a real system, you would have an Employee collection to fetch base salaries.
    // Since we don't have that explicitly, we will simulate the base salary.
    const DEFAULT_DRIVER_SALARY = 30000; 

    const payrollRecords = [];

    for (const driver of driverAdvances) {
      const driverId = driver._id.phone || driver._id.name; // Fallback to name if phone is missing
      const totalAdvances = driver.totalAdvance;
      const netPay = DEFAULT_DRIVER_SALARY - totalAdvances;

      // Upsert payroll record
      const payroll = await Payroll.findOneAndUpdate(
        { employeeId: driverId, paymentMonth: month },
        {
          employeeId: driverId,
          employeeName: driver._id.name,
          role: 'DRIVER',
          paymentMonth: month,
          baseSalary: DEFAULT_DRIVER_SALARY,
          totalAdvances: totalAdvances,
          netPay: netPay > 0 ? netPay : 0, // Ensure net pay doesn't go negative
          status: 'PENDING',
          processedAt: new Date(),
        },
        { new: true, upsert: true }
      );

      payrollRecords.push(payroll);
    }

    res.status(200).json({ success: true, data: payrollRecords });
  } catch (error) {
    console.error('Error calculating payroll:', error);
    res.status(500).json({ success: false, message: 'Server Error calculating payroll', error: error.message });
  }
};

exports.getPayroll = async (req, res) => {
  const { month } = req.query;
  try {
    const filter = month ? { paymentMonth: month } : {};
    const records = await Payroll.find(filter).sort({ processedAt: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

exports.disbursePayroll = async (req, res) => {
  const { ids } = req.body; // Array of Payroll IDs
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: 'Provide array of payroll ids to disburse' });
  }

  try {
    await Payroll.updateMany(
      { _id: { $in: ids } },
      { $set: { status: 'PAID', paidAt: new Date() } }
    );
    res.status(200).json({ success: true, message: 'Payroll disbursed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
