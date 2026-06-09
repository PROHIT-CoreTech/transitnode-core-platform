import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const renderRoleSpecificContent = () => {
    switch (user?.role) {
      case 'ADMIN':
        return (
          <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--accent-purple)' }}>Admin Controls</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You have full access to manage users, roles, and system configurations.</p>
          </div>
        );
      case 'RECEPTIONIST':
        return (
          <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--accent-cyan)' }}>Intake System</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Create new shipments and generate tracking IDs here.</p>
          </div>
        );
      case 'ACCOUNTANT':
        return (
          <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: '#4ade80' }}>Financial Ledger</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Review pending invoices and manage payments.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Welcome, {user?.name || 'User'}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Role: <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{user?.role}</span>
          </p>
        </div>
        <button 
          onClick={logout}
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--glass-border)', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Universal Stats Widget */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>System Overview</h3>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '16px', borderRadius: '8px', flex: 1 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--accent-cyan)' }}>Active Shipments</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px' }}>124</p>
            </div>
            <div style={{ background: 'rgba(176, 38, 255, 0.1)', padding: '16px', borderRadius: '8px', flex: 1 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--accent-purple)' }}>Pending Invoices</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '8px' }}>12</p>
            </div>
          </div>
        </div>

      </div>

      {renderRoleSpecificContent()}
      
    </div>
  );
};

export default Dashboard;
