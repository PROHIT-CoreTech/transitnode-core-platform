const { pool } = require('../config/db');

exports.generateBill = async (req, res) => {
  try {
    const { shipment_id, modifiers } = req.body;
    
    // Fetch shipment to get estimated cost
    const shipmentRes = await pool.query('SELECT estimated_cost FROM shipments WHERE id = $1', [shipment_id]);
    if (shipmentRes.rows.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    const baseCost = parseFloat(shipmentRes.rows[0].estimated_cost);
    let finalAmount = baseCost;
    
    // Apply modifiers (e.g. express fee)
    if (modifiers && modifiers.express) {
      finalAmount *= 1.5;
    }

    const newInvoice = await pool.query(
      'INSERT INTO invoices (shipment_id, final_amount, status) VALUES ($1, $2, $3) RETURNING *',
      [shipment_id, finalAmount, 'Unpaid']
    );

    res.status(201).json({ message: 'Bill generated successfully', invoice: newInvoice.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating bill' });
  }
};

exports.getPendingInvoices = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM invoices WHERE status = $1 ORDER BY created_at DESC', ['Unpaid']);
    res.status(200).json({ invoices: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
};
