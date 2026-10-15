import React from 'react';
import brandLogo from '../../assets/brand_logo.png';

const RefundPolicy = () => {
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

      {/* Main Content Card */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10 bg-white shadow-sm border border-slate-200 rounded-2xl text-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="mb-6 text-xs sm:text-sm text-slate-500">
          Last updated: October 15, 2026
        </p>

        <p className="mb-6 text-sm leading-relaxed text-slate-600">
          Thank you for choosing <strong>TransitNode</strong> (operated by Prohit CoreTech). This Refund &amp; Cancellation Policy outlines the terms and conditions governing subscription cancellations, renewals, and refunds for our SaaS fleet management and logistics software services.
        </p>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8">
          <p className="text-sm font-medium text-amber-900">
            <strong>Important Notice:</strong> All paid SaaS subscription plans (including Silver, Gold, and Platinum monthly subscriptions) on TransitNode are strictly <strong>non-refundable</strong> once billed or activated.
          </p>
        </div>

        {/* Section 1: Non-Refundable Policy */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">1. Non-Refundable Paid Subscriptions</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          Due to the digital and instantly accessible nature of cloud software infrastructure, user provisioning, database allocation, and real-time fleet telemetry capabilities:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-sm text-slate-600">
          <li><strong>No Full or Partial Refunds:</strong> Payments made for monthly, annual, or promotional subscription tiers are non-refundable once the billing transaction is successfully processed.</li>
          <li><strong>No Pro-Rated Refunds:</strong> If you cancel or terminate your subscription before the end of your current billing period, no pro-rated refunds or credits will be issued for unused days or remaining fleet allocations.</li>
          <li><strong>Immediate Resource Allocation:</strong> Cloud server resources, database storage, and operational quotas are provisioned immediately upon successful payment confirmation.</li>
        </ul>

        {/* Section 2: Free Exploration & Trial */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">2. Free Exploration &amp; Trial Period</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          To ensure that TransitNode meets your operational requirements before any financial commitment is made, we provide a <strong>10-Day Free Exploration Trial</strong> for all new fleet operators and enterprises.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          We strongly encourage prospective customers to utilize the free trial to thoroughly evaluate our features, vehicle management capabilities, dispatch runsheets, rate cards, and reporting modules prior to upgrading to any paid tier.
        </p>

        {/* Section 3: Subscription Cancellation */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">3. Subscription Cancellation Policy</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          You have full control over your subscription and may cancel recurring renewals at any time:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-sm text-slate-600">
          <li><strong>How to Cancel:</strong> You may initiate cancellation directly from your TransitNode Workspace Admin Portal under <em>Subscription &amp; Billing</em>, or by submitting a written cancellation request to <a href="mailto:info@prohitcoretech.com" className="text-[#187baa] underline">info@prohitcoretech.com</a>.</li>
          <li><strong>Access Until Cycle End:</strong> Upon cancellation, your workspace and all configured modules will remain fully active until the conclusion of the paid billing cycle. No further recurring charges will be incurred.</li>
          <li><strong>Data Retention:</strong> Following cancellation, your operational data and compliance vault records are securely retained for a grace period of 30 days to allow for workspace reactivation or data export.</li>
        </ul>

        {/* Section 4: Billing Errors & Duplicate Payments */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">4. Technical Billing Errors &amp; Duplicate Charges</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          We work closely with our payment gateway partner (<strong>Cashfree Payments</strong>) to maintain secure, authenticated transaction processing. In rare instances where a technical discrepancy occurs:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-sm text-slate-600">
          <li><strong>Duplicate Transactions:</strong> If your account has been accidentally charged twice for the same subscription period due to a network or gateway timeout, please notify our billing team within <strong>48 hours</strong> of transaction completion.</li>
          <li><strong>Refund Investigation:</strong> We will cross-reference the transaction ID with Cashfree API logs to verify the double debit.</li>
          <li><strong>Refund Turnaround Time:</strong> Once verified, any legitimate duplicate payment will be refunded directly back to your original source payment method (bank account, UPI, credit/debit card) within <strong>5 to 7 business days</strong>.</li>
        </ul>

        {/* Section 5: Modifications */}
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3">5. Changes to this Policy</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          TransitNode reserves the right to review, update, or modify this Refund &amp; Cancellation Policy at any time. Any changes will take effect immediately upon posting to this URL with an updated revision date.
        </p>

        {/* Section 6: Contact & Support */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contact Billing Support</h2>
          <p className="text-sm text-slate-600 mb-4">
            If you have questions, inquiries, or billing concerns regarding this policy, please reach out to our dedicated support team:
          </p>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li><strong>Email:</strong> <a href="mailto:info@prohitcoretech.com" className="text-[#187baa] underline hover:text-[#14668f]">info@prohitcoretech.com</a></li>
            <li><strong>Phone Support:</strong> <span className="font-semibold text-slate-900">+91 7738445890</span></li>
            <li><strong>Operating Hours:</strong> Monday – Saturday, 9:00 AM – 7:00 PM IST</li>
          </ul>
        </div>

        {/* Footer Navigation Links */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <span>&copy; 2026 TransitNode (Prohit CoreTech). All rights reserved.</span>
          <div className="flex space-x-4">
            <a href="/terms-of-service" className="hover:text-slate-800 underline">Terms &amp; Conditions</a>
            <a href="/privacy-policy" className="hover:text-slate-800 underline">Privacy Policy</a>
            <a href="/" className="hover:text-slate-800 underline">Home</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
