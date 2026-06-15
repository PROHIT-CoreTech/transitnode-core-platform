const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'backend', 'src', 'controllers');

const filesToUpdate = [
  'adminController.js',
  'billController.js',
  'exportController.js',
  'financeController.js',
  'payrollController.js',
  'shipController.js',
  'transportController.js'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace { tenantId: req.user.tenantId } with { tenantId: req.user.tenantId, companyId: req.workspaceId }
  // Handle various spacing
  content = content.replace(/tenantId:\s*req\.user\.tenantId(?!,\s*companyId)/g, 'tenantId: req.user.tenantId, companyId: req.workspaceId');
  
  // Handle cases where it uses tenantMatch
  content = content.replace(/const tenantMatch = { tenantId: new mongoose\.Types\.ObjectId\(req\.user\.tenantId\) };/g, 
    "const tenantMatch = { tenantId: new mongoose.Types.ObjectId(req.user.tenantId), companyId: req.workspaceId };"
  );
  
  // Handle case where it just assigns query.tenantId
  content = content.replace(/query\.tenantId = req\.user\.tenantId;/g, 
    "query.tenantId = req.user.tenantId;\n    query.companyId = req.workspaceId;"
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
