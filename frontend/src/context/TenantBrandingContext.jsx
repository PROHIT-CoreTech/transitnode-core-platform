import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const TenantBrandingContext = createContext();

export const useTenantBranding = () => {
  const context = useContext(TenantBrandingContext);
  if (!context) {
    return {
      branding: { dominantHexColor: '#3b82f6', logoUrl: '' },
      setBranding: () => {}
    };
  }
  return {
    ...context,
    branding: {
      dominantHexColor: context.tenantProfile?.themeColorHex || context.tenantProfile?.brandingOptions?.dominantHexColor || '#3b82f6',
      logoUrl: context.tenantProfile?.logoUrl || context.tenantProfile?.brandingOptions?.logoUrl || ''
    },
    setBranding: (newBranding) => {
      if (context.setTenantProfile) {
        context.setTenantProfile(prev => ({
          ...prev,
          themeColorHex: newBranding.dominantHexColor,
          logoUrl: newBranding.logoUrl,
          brandingOptions: {
            ...prev?.brandingOptions,
            dominantHexColor: newBranding.dominantHexColor,
            logoUrl: newBranding.logoUrl
          }
        }));
      }
    }
  };
};

export const TenantBrandingProvider = ({ children }) => {
  const [tenantState, setTenantState] = useState('LOADING'); // 'LOADING', 'MAIN_LANDING_PAGE', 'TENANT_RESOLVED', 'ERROR'
  const [tenantProfile, setTenantProfile] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const fetchTenantBySubdomain = async (subdomainQuery) => {
    if (!subdomainQuery || subdomainQuery.trim() === '') return null;
    try {
      const response = await axios.get(`/api/saas/tenant-profile?subdomain=${encodeURIComponent(subdomainQuery.trim())}`);
      const profileData = response.data;
      if (profileData.themeColorHex) {
        document.documentElement.style.setProperty('--color-tenant-primary', profileData.themeColorHex);
        document.documentElement.style.setProperty('--tenant-primary', profileData.themeColorHex);
      }
      setTenantProfile(profileData);
      setTenantState('TENANT_RESOLVED');
      return profileData;
    } catch (err) {
      console.error('Failed to resolve tenant profile for:', subdomainQuery, err);
      return null;
    }
  };

  useEffect(() => {
    const initializeTenant = async () => {
      const hostname = window.location.hostname;
      const subdomain = hostname.split('.')[0];
      
      const urlParams = new URLSearchParams(window.location.search);
      const querySubdomain = urlParams.get('subdomain') || urlParams.get('tenant') || urlParams.get('workspace');

      let targetSubdomain = querySubdomain;

      if (!targetSubdomain) {
        const isMainDomain = 
          hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          subdomain === 'masteradmin' ||
          hostname.startsWith('masteradmin.') ||
          hostname === 'transitnode.in' || 
          hostname === 'www.transitnode.in' ||
          hostname === 'corematrix.in' ||
          hostname === 'www.corematrix.in' ||
          hostname === 'prohitcoretech.in' ||
          hostname === 'www.prohitcoretech.in' ||
          hostname === 'prohitcoretech.com' ||
          hostname === 'www.prohitcoretech.com' ||
          hostname === 'transitnode.prohitcoretech.com' ||
          hostname === 'www.transitnode.prohitcoretech.com' ||
          hostname.endsWith('.vercel.app');

        if (!isMainDomain && subdomain && subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== '127') {
          targetSubdomain = subdomain;
        }
      }

      if (!targetSubdomain) {
        setTenantState('MAIN_LANDING_PAGE');
        return;
      }

      try {
        const response = await axios.get(`/api/saas/tenant-profile?subdomain=${encodeURIComponent(targetSubdomain.trim())}`);
        const profileData = response.data;
        
        // Dynamically apply hex code to root CSS variables for instant skinning
        if (profileData.themeColorHex) {
          document.documentElement.style.setProperty('--color-tenant-primary', profileData.themeColorHex);
          document.documentElement.style.setProperty('--tenant-primary', profileData.themeColorHex);
        }
        
        setTenantProfile(profileData);
        setTenantState('TENANT_RESOLVED');
      } catch (error) {
        console.error('Failed to resolve tenant profile', error);
        setErrorDetails(error.response?.data?.error || 'Tenant Resolution Failed');
        setTenantState('ERROR');
      }
    };

    initializeTenant();
  }, []);

  return (
    <TenantBrandingContext.Provider value={{ tenantState, tenantProfile, setTenantProfile, errorDetails, fetchTenantBySubdomain }}>
      {children}
    </TenantBrandingContext.Provider>
  );
};
