const FlipkartMIS = require('../models/NoSQL/FlipkartMIS');
const ExcelJS = require('exceljs');

// Create a new Flipkart MIS record
exports.createRecord = async (req, res) => {
  try {
    const {
      date,
      sourceHubName,
      companyName,
      vehicleNumber,
      vehicleType,
      parentVehicleNumber,
      vehicleOwnershipType,
      driverType,
      inTime,
      outTime,
      manualStartOdometer,
      manualEndOdometer,
      movementType,
      zone,
      businessEntity,
      vendorName
    } = req.body;

    // Server-side validation
    if (
      !date ||
      !sourceHubName ||
      !companyName ||
      !vehicleNumber ||
      !vehicleType ||
      !vehicleOwnershipType ||
      !driverType ||
      !inTime ||
      !outTime ||
      manualStartOdometer === undefined ||
      manualEndOdometer === undefined ||
      !movementType ||
      !zone ||
      !businessEntity ||
      !vendorName
    ) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const inDate = new Date(inTime);
    const outDate = new Date(outTime);

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      return res.status(400).json({ message: 'In Time and Out Time must be valid dates.' });
    }

    if (outDate < inDate) {
      return res.status(400).json({ message: 'Out Time must be after or equal to In Time.' });
    }

    const startOdo = parseInt(manualStartOdometer, 10);
    const endOdo = parseInt(manualEndOdometer, 10);

    if (isNaN(startOdo) || isNaN(endOdo) || startOdo < 0 || endOdo < 0) {
      return res.status(400).json({ message: 'Odometer readings must be non-negative integers.' });
    }

    if (endOdo < startOdo) {
      return res.status(400).json({ message: 'End Odometer must be greater than or equal to Start Odometer.' });
    }

    // Calculations
    const diffMs = outDate - inDate;
    const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const workingHours = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    const actualTransitTime = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    const manualDistanceTravelled = parseFloat(((endOdo - startOdo) / 1000).toFixed(3));

    const newRecord = await FlipkartMIS.create({
      tenantId: req.user.tenantId,
      date: new Date(date),
      sourceHubName,
      companyName,
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      vehicleType,
      parentVehicleNumber: parentVehicleNumber ? parentVehicleNumber.trim() : '',
      vehicleOwnershipType,
      driverType,
      inTime: inDate,
      outTime: outDate,
      workingHours,
      actualTransitTime,
      manualStartOdometer: startOdo,
      manualEndOdometer: endOdo,
      manualDistanceTravelled,
      movementType,
      zone,
      businessEntity,
      vendorName
    });

    res.status(201).json({ message: 'Flipkart MIS record created successfully', record: newRecord });
  } catch (error) {
    console.error('Error creating Flipkart MIS record:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Retrieve Flipkart MIS records for tenant
exports.getRecords = async (req, res) => {
  try {
    console.log('[DEBUG] getRecords controller started, tenantId:', req.user?.tenantId);
    const records = await FlipkartMIS.find({ tenantId: req.user.tenantId }).sort({ date: -1, createdAt: -1 });
    console.log(`[DEBUG] getRecords found ${records.length} records`);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching Flipkart MIS records:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

// Export records as Excel matching Flipkart MIS Format.xlsx
exports.exportExcel = async (req, res) => {
  try {
    const records = await FlipkartMIS.find({ tenantId: req.user.tenantId }).sort({ date: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Vehicle Data');

    // Define column widths starting from Column B
    worksheet.columns = [
      { key: 'emptyA', width: 5 }, // Col A (Empty)
      { key: 'date', width: 15 }, // Col B
      { key: 'sourceHubName', width: 20 }, // Col C
      { key: 'companyName', width: 25 }, // Col D
      { key: 'vehicleNumber', width: 18 }, // Col E
      { key: 'vehicleType', width: 15 }, // Col F
      { key: 'parentVehicleNumber', width: 20 }, // Col G
      { key: 'vehicleOwnershipType', width: 22 }, // Col H
      { key: 'driverType', width: 15 }, // Col I
      { key: 'inTime', width: 20 }, // Col J
      { key: 'outTime', width: 20 }, // Col K
      { key: 'workingHours', width: 22 }, // Col L
      { key: 'actualTransitTime', width: 28 }, // Col M
      { key: 'manualStartOdometer', width: 32 }, // Col N
      { key: 'manualEndOdometer', width: 32 }, // Col O
      { key: 'manualDistanceTravelled', width: 32 }, // Col P
      { key: 'movementType', width: 18 }, // Col Q
      { key: 'zone', width: 12 }, // Col R
      { key: 'businessEntity', width: 18 }, // Col S
      { key: 'vendorName', width: 25 } // Col T
    ];

    // Header row on Row 2 (leaving Row 1 and Col A empty)
    const headerRow = worksheet.getRow(2);

    const headers = [
      'Date',
      'Source Hub Name',
      'Company Name',
      'Vehicle Number',
      'Vehicle Type',
      'Parent Vehicle Number',
      'Vehicle Ownership Type',
      'Driver Type',
      'In Time',
      'Out Time',
      'Working Hours (HH:MM)',
      'Actual Transit Time (In Hours)',
      'Manual Start Odometer (in meters)',
      'Manual End Odometer (in meters)',
      'Manual Distance Travelled (in KM)',
      'Movement Type',
      'Zone',
      'Business Entity',
      'Vendor (Purchae) Name'
    ];

    // Write headers starting from Column B (index 2)
    headers.forEach((header, index) => {
      const cell = headerRow.getCell(index + 2);
      cell.value = header;
      cell.font = { name: 'Arial', size: 10, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Light gray fill for headers
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    headerRow.height = 25;

    // Write data rows starting from Row 3
    records.forEach((record, rIndex) => {
      const row = worksheet.getRow(rIndex + 3);
      row.height = 20;

      const rowValues = [
        record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        record.sourceHubName,
        record.companyName,
        record.vehicleNumber,
        record.vehicleType,
        record.parentVehicleNumber || '',
        record.vehicleOwnershipType,
        record.driverType,
        record.inTime ? new Date(record.inTime).toISOString().replace('T', ' ').substring(0, 19) : '',
        record.outTime ? new Date(record.outTime).toISOString().replace('T', ' ').substring(0, 19) : '',
        record.workingHours,
        record.actualTransitTime,
        record.manualStartOdometer,
        record.manualEndOdometer,
        record.manualDistanceTravelled,
        record.movementType,
        record.zone,
        record.businessEntity,
        record.vendorName
      ];

      rowValues.forEach((val, cIndex) => {
        const cell = row.getCell(cIndex + 2);
        cell.value = val;
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        
        // Right align numeric values
        if (typeof val === 'number') {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
      });
    });

    // Write buffer and respond
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Flipkart_MIS_Report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting Flipkart MIS report:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};
