import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PublicTracker = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/login')}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          ← Back to Login
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '8px' }}>Track Shipment</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Tracking ID: <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{trackingId}</span>
        </p>

        <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '24px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '60px', height: '60px', borderRadius: '30px', background: 'var(--accent-cyan)', marginBottom: '16px', boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)' }}></div>
          <h3 style={{ color: 'var(--accent-cyan)' }}>In Transit</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Last updated: Just now</p>
        </div>
        
        <div style={{ marginTop: '32px' }}>
          <h4 style={{ marginBottom: '16px' }}>Live Telemetry</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Speed</p>
              <p style={{ fontSize: '1.25rem', marginTop: '4px' }}>65 km/h</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</p>
              <p style={{ fontSize: '1.25rem', marginTop: '4px', color: '#4ade80' }}>MOVING</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default PublicTracker;
