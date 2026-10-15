import React from 'react';
import brandLogo from '../../assets/brand_logo.png';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header & Back Navigation */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          <img src={brandLogo} alt="TransitNode Logo" className="h-7 w-auto object-contain" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Transit<span className="text-[#187baa]">Node</span>
          </span>
        </div>
        <a 
          href="/" 
          className="text-xs sm:text-sm font-semibold text-[#187baa] hover:text-[#14668f] flex items-center space-x-1"
        >
          <span>← Back to Home</span>
        </a>
      </div>

      <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-white shadow-sm border border-slate-200 rounded-2xl text-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Terms &amp; Conditions</h1>
        <p className="mb-6 text-xs sm:text-sm text-slate-500">Last updated: October 15, 2026</p>

        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Please read these Terms &amp; Conditions ("Terms", "Terms of Service") carefully before using the TransitNode
          application (the "Service") operated by Prohit CoreTech ("us", "we", or "our").
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">1. Agreement to Terms</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These
          Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service
          you agree to be bound by these Terms.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">2. Subscriptions, Payments &amp; Cancellation</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on
          a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis,
          depending on the type of subscription plan you select when purchasing a Subscription.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          A valid payment method, including UPI, Net Banking, or Credit/Debit card, is required to process the payment for your Subscription. We use
          authorized third-party payment processors (such as <strong>Cashfree Payments</strong>) to handle these transactions securely.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          <strong>Non-Refundable Policy:</strong> All paid subscription fees are strictly non-refundable once billed and activated. You may cancel your subscription renewal at any time through your workspace admin portal or by emailing <a href="mailto:info@prohitcoretech.com" className="text-[#187baa] underline">info@prohitcoretech.com</a>. For full terms, please consult our <a href="/refund-policy" className="text-[#187baa] underline font-medium">Refund &amp; Cancellation Policy</a>.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">3. User Accounts</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          When you create an account with us, you must provide us information that is accurate, complete, and current at all
          times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your
          account on our Service.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          You are responsible for safeguarding the password that you use to access the Service and for any activities or
          actions under your password.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">4. Prohibited Uses</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-sm text-slate-600">
          <li>In any way that violates any applicable national or international law or regulation.</li>
          <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service.</li>
          <li>To attempt to bypass or break any security mechanism of the Service.</li>
          <li>To reverse engineer, decompile, or disassemble any part of the Service.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">5. Termination</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever,
          including without limitation if you breach the Terms. Upon termination, your right to use the Service will
          immediately cease.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">6. Limitation of Liability</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          In no event shall TransitNode, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable
          for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of
          profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to
          access or use the Service.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">7. Changes to Terms</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
          material we will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Contact Us</h2>
          <p className="text-sm text-slate-600 mb-4">If you have any questions about these Terms, please contact us:</p>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li><strong>Email:</strong> <a href="mailto:info@prohitcoretech.com" className="text-[#187baa] underline hover:text-[#14668f]">info@prohitcoretech.com</a></li>
            <li><strong>Phone:</strong> <span className="font-semibold text-slate-900">+91 7738445890</span></li>
            <li><strong>Operating Hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM IST</li>
          </ul>
        </div>

        {/* Footer Navigation Links */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>&copy; 2026 TransitNode (Prohit CoreTech). All rights reserved.</span>
          <div className="flex space-x-4">
            <a href="/privacy-policy" className="hover:text-slate-800 underline">Privacy Policy</a>
            <a href="/refund-policy" className="hover:text-slate-800 underline">Refund &amp; Cancellation Policy</a>
            <a href="/" className="hover:text-slate-800 underline">Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
