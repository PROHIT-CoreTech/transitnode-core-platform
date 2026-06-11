const ShipmentLedger = require('../models/NoSQL/ShipmentLedger');
// We generate raw string for simplicity without adding deps.

exports.exportTallyXML = async (req, res) => {
  try {
    // Fetch last 30 days of data for export
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const shipments = await ShipmentLedger.find({ 'metadata.createdAt': { $gte: thirtyDaysAgo } });

    // Build raw Tally XML (simplified Tally.ERP 9 structure)
    let xmlBody = `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>TransitNode ERP</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
`;

    for (const shipment of shipments) {
      const dateStr = new Date(shipment.metadata.createdAt).toISOString().split('T')[0].replace(/-/g, '');
      const amt = shipment.accounting?.grandTotal || 0;
      const subtotal = shipment.accounting?.subtotal || 0;
      const gst = shipment.accounting?.tax?.gstAmount || 0;
      const partyName = shipment.logistics?.sender?.name || 'Cash Customer';

      // Sales Voucher
      xmlBody += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>${dateStr}</DATE>
            <NARRATION>Freight Sale - Tracking: ${shipment.trackingNumber}</NARRATION>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <PARTYLEDGERNAME>${partyName}</PARTYLEDGERNAME>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${partyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${amt}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Freight Income</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${subtotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${gst / 2}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>SGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${gst / 2}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>\n`;
    }

    xmlBody += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="tally_export.xml"');
    res.status(200).send(xmlBody);

  } catch (error) {
    console.error('Error generating Tally XML:', error);
    res.status(500).json({ success: false, message: 'Server Error generating XML', error: error.message });
  }
};
