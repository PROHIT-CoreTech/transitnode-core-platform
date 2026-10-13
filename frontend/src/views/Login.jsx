import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { TenantBrandingContext } from '../context/TenantBrandingContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { tenantProfile } = useContext(TenantBrandingContext);
  const navigate = useNavigate();

  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  const isMasterAdminPortal = subdomain.toLowerCase() === 'masteradmin';

  // Redirect to Admin Setup if workspace payment is complete but admin setup is pending
  useEffect(() => {
    if (tenantProfile && tenantProfile.adminSetupComplete === false && !isMasterAdminPortal && subdomain && subdomain !== 'www') {
      navigate('/setup-admin');
    }
  }, [tenantProfile, isMasterAdminPortal, subdomain, navigate]);

  const [successMessage, setSuccessMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('payment_success') === 'true'
      ? 'Payment successful! Your workspace has been activated. Please check your registered mobile/email for the magic login link.'
      : '';
  });

  const resolveLogoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = process.env.REACT_APP_API_URL || '';
    return `${backendBase}${url}`;
  };

  const handleInitMasterUser = async () => {
    if (!window.confirm('Are you sure you want to initialize the Master Admin tenant and user? This will create master@transitnode.com with the default password.')) {
      return;
    }
    setInitLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.post('/api/master-admin/setup-first-user', {}, {
        headers: {
          'x-master-admin-key': process.env.REACT_APP_MASTER_KEY || 'c3cb4790ebc7043b5db97c106c88e5dc93f8c8717f8e90f5cc967f885d0d47eb'
        }
      });
      setSuccessMessage(`${response.data.message}. You can now sign in with username: ${response.data.email} and password: ${response.data.password}`);
    } catch (err) {
      if (err.response) {
        setError(`Initialization Failed: ${err.response.data?.error || 'Unknown error'}`);
      } else {
        setError(`Network Error: ${err.message}`);
      }
    } finally {
      setInitLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const activeSubdomain = isMasterAdminPortal 
        ? undefined 
        : (tenantProfile?.customSubdomain || (subdomain !== 'localhost' && subdomain !== '127' && subdomain !== 'www' ? subdomain : undefined));

      const response = await axios.post('/api/auth/login', {
        email,
        password,
        subdomain: activeSubdomain
      });

      const token = response.data.token;
      const user = response.data.user;

      login(token, user);
      
      // Route based on subdomain first, then role
      if (subdomain === 'masteradmin') {
        navigate('/master-admin');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Unknown server error'}`);
      } else {
        setError(`Network/Proxy Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '16px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '40px 32px' }}>
        
        {/* Workspace / Tenant Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* Corporate Logo or Monogram Icon */}
          {tenantProfile?.logoUrl ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
              <img 
                src={resolveLogoUrl(tenantProfile.logoUrl)} 
                alt={tenantProfile.companyName || 'Tenant Logo'} 
                style={{ 
                  maxHeight: '68px', 
                  maxWidth: '220px', 
                  objectFit: 'contain',
                  borderRadius: '8px',
                  filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.25))'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '54px', 
                height: '54px', 
                borderRadius: '16px', 
                background: tenantProfile?.themeColorHex 
                  ? `linear-gradient(135deg, ${tenantProfile.themeColorHex} 0%, #1e293b 100%)`
                  : 'linear-gradient(135deg, #3b82f6 0%, #0d9488 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontWeight: 'bold', 
                fontSize: '1.35rem', 
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                {tenantProfile?.companyName ? tenantProfile.companyName.substring(0, 2).toUpperCase() : 'TN'}
              </div>
            </div>
          )}

          {/* Tenant Registered Name */}
          <h1 style={{ 
            fontSize: (tenantProfile?.companyName && tenantProfile.companyName.length > 25) ? '1.35rem' : '1.75rem', 
            fontWeight: '700', 
            marginBottom: '6px', 
            color: '#f8fafc', 
            letterSpacing: '-0.02em', 
            lineHeight: 1.25 
          }}>
            {tenantProfile?.companyName || 'TransitNode'}
          </h1>

          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
            {tenantProfile?.companyName ? 'Registered Logistics Workspace' : 'Logistics Management System'}
          </p>

          {/* Workspace Subdomain Badge */}
          {tenantProfile?.customSubdomain && (
            <div style={{ marginTop: '10px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 12px',
                borderRadius: '9999px',
                fontSize: '0.72rem',
                fontWeight: '500',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: tenantProfile.themeColorHex || '#93c5fd',
                border: `1px solid ${tenantProfile.themeColorHex ? tenantProfile.themeColorHex + '40' : 'rgba(147, 197, 253, 0.25)'}`
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                {tenantProfile.customSubdomain}.transitnode.in
              </span>
            </div>
          )}
        </div>


        {successMessage && (
          <div style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.3)', color: '#2dd4bf', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
            {successMessage}
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', color: '#ff6b6b', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label className="input-label">Email Address or Mobile Number</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="admin@transitnode.com or 9876543210"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%',
              backgroundColor: tenantProfile?.themeColorHex || undefined,
              borderColor: tenantProfile?.themeColorHex || undefined
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : `Sign In to ${tenantProfile?.companyName ? tenantProfile.companyName.split(' ')[0] : 'TransitNode'}`}
          </button>
        </form>

        {isMasterAdminPortal && (
          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              style={{
                width: '100%',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px dashed #eab308',
                color: '#facc15',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                transition: 'all 0.3s ease'
              }}
              disabled={initLoading || loading}
              onClick={handleInitMasterUser}
            >
              {initLoading ? 'Initializing Master User...' : 'Initialize Master User'}
            </button>
          </div>
        )}

        <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.02em', opacity: 0.6 }}>
            © 2026 PROHIT CoreTech — All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
