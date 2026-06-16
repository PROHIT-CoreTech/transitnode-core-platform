const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend/src');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace single quoted literal URLs
  // 'http://localhost:3000/api...' -> `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api...`
  content = content.replace(/'http:\/\/localhost:3000\/([^']*)'/g, '`${process.env.REACT_APP_API_URL || \'http://localhost:3000\'}/$1`');
  
  // Replace double quoted literal URLs
  content = content.replace(/"http:\/\/localhost:3000\/([^"]*)"/g, '`${process.env.REACT_APP_API_URL || \'http://localhost:3000\'}/$1`');

  // Replace inside template literals
  // `http://localhost:3000/api/${someVar}` -> `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/${someVar}`
  content = content.replace(/`http:\/\/localhost:3000\/([^`]*)`/g, '`${process.env.REACT_APP_API_URL || \'http://localhost:3000\'}/$1`');

  // Also catch io('http://localhost:3000') exactly
  content = content.replace(/'http:\/\/localhost:3000'/g, 'process.env.REACT_APP_API_URL || \'http://localhost:3000\'');
  content = content.replace(/"http:\/\/localhost:3000"/g, 'process.env.REACT_APP_API_URL || \'http://localhost:3000\'');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

traverse(directory);
console.log("Done.");
