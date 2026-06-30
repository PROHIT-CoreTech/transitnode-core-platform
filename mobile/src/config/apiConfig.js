import axios from 'axios';

// Dynamic API Base URL construction
let apiURL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
if (!apiURL.endsWith('/api')) {
  apiURL = `${apiURL}/api`;
}

const apiConfig = axios.create({
  baseURL: apiURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiConfig;
