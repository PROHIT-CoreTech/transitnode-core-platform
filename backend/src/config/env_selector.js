/**
 * Dynamic Environment Variable Selector
 * Overrides MONGO_URI, JWT_SECRET, and MASTER_ADMIN_SECRET_KEY in process.env
 * dynamically based on the selected NODE_ENV (localhost, development, production).
 */

const path = require('path');
const dotenv = require('dotenv');

// Ensure dotenv has parsed the .env file (if not loaded yet)
// We look for .env in the backend root directory (two levels up from src/config)
dotenv.config({ path: path.join(__dirname, '../../.env') });

const rawEnv = process.env.NODE_ENV || 'localhost';
const env = rawEnv.trim().toLowerCase();

// Define mapping keys
const suffix = env === 'localhost' ? 'LOCALHOST' : env === 'development' ? 'DEVELOPMENT' : 'PRODUCTION';

const MONGO_URI_KEY = `MONGO_URI_${suffix}`;
const JWT_SECRET_KEY = `JWT_SECRET_${suffix}`;
const MASTER_ADMIN_SECRET_KEY_KEY = `MASTER_ADMIN_SECRET_KEY_${suffix}`;

// Apply the dynamic mappings if they exist, otherwise fallback to the default base keys
if (process.env[MONGO_URI_KEY]) {
  process.env.MONGO_URI = process.env[MONGO_URI_KEY];
}
if (process.env[JWT_SECRET_KEY]) {
  process.env.JWT_SECRET = process.env[JWT_SECRET_KEY];
}
if (process.env[MASTER_ADMIN_SECRET_KEY_KEY]) {
  process.env.MASTER_ADMIN_SECRET_KEY = process.env[MASTER_ADMIN_SECRET_KEY_KEY];
}

console.log(`[ENV_SELECTOR] Selected NODE_ENV: "${env.toUpperCase()}"`);
console.log(`[ENV_SELECTOR] Mapping config to env-specific keys: ${suffix}`);
if (process.env.MONGO_URI) {
  // Safe logging of MONGO_URI to confirm connection targets
  const maskedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@');
  console.log(`[ENV_SELECTOR] Active MONGO_URI: ${maskedUri}`);
}

module.exports = {
  activeEnv: env,
  suffix
};
