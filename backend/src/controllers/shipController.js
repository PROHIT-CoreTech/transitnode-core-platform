const { pool } = require('../config/db');

exports.createShipment = async (req, res) => {
  try {
    const { origin, destination, weight_kg } = req.body;
    
    // Generate a simple tracking ID
    const tracking_id = 'TN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Base estimation logic
    const estimated_cost = weight_kg * 5.5; // Example: $5.50 per kg
    
    const newShipment = await pool.query(
      'INSERT INTO shipments (tracking_id, origin, destination, weight_kg, estimated_cost, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [tracking_id, origin, destination, weight_kg, estimated_cost, 'Pending Intake']
    );

    res.status(201).json({ message: 'Shipment created', shipment: newShipment.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating shipment' });
  }
};

exports.listShipments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipments ORDER BY created_at DESC');
    res.status(200).json({ shipments: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching shipments' });
  }
};

exports.getShipment = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const result = await pool.query('SELECT * FROM shipments WHERE tracking_id = $1', [trackingId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    
    res.status(200).json({ shipment: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching shipment details' });
  }
};
