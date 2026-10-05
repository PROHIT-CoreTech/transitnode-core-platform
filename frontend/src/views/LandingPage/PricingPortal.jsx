import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import HeroSection from './HeroSection';
import PricingCardsSection from './PricingCardsSection';
import TestimonialsSection from './TestimonialsSection';
import WhyUsSection from './WhyUsSection';
import AboutUsSection from './AboutUsSection';
import ContactUsSection from './ContactUsSection';
import Footer from './Footer';
import RegisterModal from './RegisterModal';

const PricingPortal = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const domainSuffix = isLocalhost ? '.localhost:3001' : '.transitnode.prohitcoretech.com';

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [formData, setFormData] = useState({
    companyName: '',
    registeredMobile: '',
    customSubdomain: ''
  });
  const [currentStep, setCurrentStep] = useState('WORKSPACE');
  const [tenantInfo, setTenantInfo] = useState(null);
  const [adminData, setAdminData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);

  React.useEffect(() => {
    const fetchPublicTestimonials = async () => {
      setLoadingTestimonials(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const res = await axios.get(`${apiUrl}/api/saas/testimonials`);
        if (res.data?.testimonials && res.data.testimonials.length > 0) {
          setTestimonials(res.data.testimonials);
        } else {
          setTestimonials([
            {
              name: "Anis S.",
              role: "Head of Operations, Indigo",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
              quote: "TransitNode simplified our fleet operations and automated invoicing across regional routes efficiently.",
              rating: 5,
              createdAt: "2026-03-01T10:00:00.000Z"
            },
            {
              name: "Vikram Mehta",
              role: "Managing Director, Apex Logistics",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
              quote: "The real-time telemetry and compliance vault cut down our administrative overhead by more than 40%.",
              rating: 5,
              createdAt: "2026-02-15T10:00:00.000Z"
            },
            {
              name: "Priya Sharma",
              role: "VP Supply Chain, Transport Core",
              avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
              quote: "Managing multi-company workspaces with automated rate cards has never been this seamless.",
              rating: 5,
              createdAt: "2026-01-20T10:00:00.000Z"
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch public testimonials:', err);
        setTestimonials([
          {
            name: "Anis S.",
            role: "Head of Operations, Indigo",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            quote: "TransitNode simplified our fleet operations and automated invoicing across regional routes efficiently.",
            rating: 5,
            createdAt: "2026-03-01T10:00:00.000Z"
          },
          {
            name: "Vikram Mehta",
            role: "Managing Director, Apex Logistics",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            quote: "The real-time telemetry and compliance vault cut down our administrative overhead by more than 40%.",
            rating: 5,
            createdAt: "2026-02-15T10:00:00.000Z"
          },
          {
            name: "Priya Sharma",
            role: "VP Supply Chain, Transport Core",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
            quote: "Managing multi-company workspaces with automated rate cards has never been this seamless.",
            rating: 5,
            createdAt: "2026-01-20T10:00:00.000Z"
          }
        ]);
      } finally {
        setLoadingTestimonials(false);
      }
    };
    fetchPublicTestimonials();
  }, []);

  // Step 1: Create Workspace
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/saas/register-tenant`, { ...formData, planTier: selectedPlan });
      
      const data = response.data;
      setTenantInfo(data);
      setAdminData(prev => ({ ...prev, username: formData.registeredMobile }));

      const isPaidPlan = selectedPlan !== 'free' && selectedPlan !== 'TRIAL';
      if (isPaidPlan) {
        setCurrentStep('PAYMENT');
      } else {
        setCurrentStep('ADMIN_SETUP');
      }
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Payment Integration
  const handlePayment = async () => {
    if (tenantInfo?.orderSessionId && window.Cashfree) {
      const mode = isLocalhost ? 'sandbox' : 'production';
      const cashfree = window.Cashfree({ mode });
      cashfree.checkout({
        paymentSessionId: tenantInfo.orderSessionId,
        redirectTarget: "_self"
      });
    } else {
      setCurrentStep('ADMIN_SETUP');
    }
  };

  // Step 3: Admin Setup
  const handleAdminSetup = async (e) => {
    e.preventDefault();
    if (adminData.password !== adminData.confirmPassword) {
      setResult({ success: false, message: 'Passwords do not match' });
      return;
    }
    if (adminData.password.length < 6) {
      setResult({ success: false, message: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      await axios.post(`${apiUrl}/api/users/setup-admin`, {
        username: adminData.username,
        password: adminData.password,
        tenantId: tenantInfo?.tenantId
      });

      setCurrentStep('COMPLETE');
      setResult({
        success: true,
        message: 'Admin account created successfully! Workspace is now fully activated.',
        fullLoginUrl: tenantInfo?.fullLoginUrl
      });
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to setup admin account' });
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = (plan = 'free') => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-500/20">
      {/* Light Gradient Subtle Highlights */}
      <div className="fixed top-0 right-0 w-[800px] h-[600px] bg-gradient-to-b from-sky-100/60 via-blue-50/40 to-transparent blur-3xl pointer-events-none z-0"></div>
      
      {/* Navigation Header */}
      <Header openRegisterModal={openRegisterModal} />

      {/* Main Sections */}
      <HeroSection openRegisterModal={openRegisterModal} />
      <PricingCardsSection openRegisterModal={openRegisterModal} />
      <TestimonialsSection testimonials={testimonials} isLoading={loadingTestimonials} />
      <WhyUsSection />
      <AboutUsSection />
      <ContactUsSection />

      {/* Footer */}
      <Footer />
      
      {/* Interactive SaaS Registration Portal Modal */}
      <RegisterModal 
        showModal={showModal}
        setShowModal={setShowModal}
        selectedPlan={selectedPlan}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        formData={formData}
        setFormData={setFormData}
        adminData={adminData}
        setAdminData={setAdminData}
        domainSuffix={domainSuffix}
        isLocalhost={isLocalhost}
        tenantInfo={tenantInfo}
        loading={loading}
        result={result}
        setResult={setResult}
        handleCreateWorkspace={handleCreateWorkspace}
        handlePayment={handlePayment}
        handleAdminSetup={handleAdminSetup}
      />
    </div>
  );
};

export default PricingPortal;
