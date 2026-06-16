const verifyMasterKey = (req, res, next) => {
  const masterKey = req.headers['x-master-admin-key'];
  const validKey = process.env.MASTER_ADMIN_SECRET_KEY;

  if (!masterKey) {
    return res.status(401).json({ error: 'Missing Master Admin Key.' });
  }

  if (masterKey !== validKey) {
    return res.status(403).json({ error: 'Invalid Master Admin Key.' });
  }

  next();
};

module.exports = verifyMasterKey;
