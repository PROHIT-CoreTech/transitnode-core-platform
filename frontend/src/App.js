import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantBrandingProvider } from './context/TenantBrandingContext.jsx';
import AppRouter from './routes/AppRouter.jsx';
import { Analytics } from '@vercel/analytics/react';
import './index.css';

const App = () => {
  return (
    <AuthProvider>
      <TenantBrandingProvider>
        <Router>
          <AppRouter />
        </Router>
      </TenantBrandingProvider>
      <Analytics />
    </AuthProvider>
  );
};

export default App;
