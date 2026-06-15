const Company = require('../models/NoSQL/Company');

const addSisterCompany = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ success: false, message: 'companyName is required' });
    }

    const newCompany = new Company({
      tenantId,
      companyName,
      isActive: true,
    });

    await newCompany.save();

    res.status(201).json({
      success: true,
      message: 'Sister company created successfully',
      company: newCompany,
    });
  } catch (error) {
    console.error('Create Sister Company Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while creating company' });
  }
};

const getWorkspaces = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing tenant ID' });
    }

    const workspaces = await Company.find({ tenantId });
    
    res.status(200).json({
      success: true,
      workspaces
    });
  } catch (error) {
    console.error('Get Workspaces Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching workspaces' });
  }
};

module.exports = {
  addSisterCompany,
  getWorkspaces
};
