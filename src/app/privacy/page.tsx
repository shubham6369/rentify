import React from 'react';
import Link from 'next/link';
import { Shield, Lock, FileText, ArrowLeft, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Find Your Stay',
  description: 'Find Your Stay official privacy policy detailing data protection, user accounts, and payment security.'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Official Privacy Policy</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Privacy Policy for Find Your Stay</h1>
        <p className="text-xs text-slate-500">Last updated: October 23, 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            1. Overview & Information We Collect
          </h2>
          <p>
            Find Your Stay (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the Find Your Stay mobile application and website. We collect information necessary to process student accommodations, family holiday villas, and leisure trip bookings.
          </p>
          <ul className="list-disc pl-5 space-y-1 pt-1">
            <li><strong>Account Data:</strong> Full Name, Email Address, Mobile Phone Number.</li>
            <li><strong>Student Verification Data (Student Stays):</strong> University/College name, Student Enrollment/Roll Number, and Parent/Guardian Emergency Contact.</li>
            <li><strong>Family Reservation Details:</strong> Headcount of adults and children for crib and bedding allocation.</li>
            <li><strong>Device & Network Data:</strong> Internet connectivity status and standard device identifiers required by Google Play and Capacitor bridge.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            2. Payment Security & Financial Data
          </h2>
          <p>
            All online financial transactions are handled securely through <strong>Razorpay Payment Gateway</strong> using end-to-end TLS encryption and HMAC-SHA256 signature verification. Find Your Stay does NOT store your debit/credit card CVV or net banking passwords on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            3. How We Use Your Information
          </h2>
          <p>
            Your information is exclusively used to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirm and generate your official digital Move-in Pass or Stay Voucher.</li>
            <li>Verify guest authenticity with verified property hosts.</li>
            <li>Send one-time security OTPs for passwordless authentication.</li>
            <li>Comply with local hospitality regulations and safety guidelines.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            4. User Rights & Account Deletion
          </h2>
          <p>
            In accordance with Google Play Developer Policies, all users have the right to request deletion of their account and associated data. You can request account deletion at any time by contacting our support team at <strong>privacy@findyourstay.in</strong> or through your account dashboard.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 tracking-wide flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" />
            5. Contact Us
          </h2>
          <p>
            If you have questions about this privacy statement, please contact us at:
          </p>
          <p className="font-semibold text-slate-900">
            Find Your Stay Data Protection Officer<br />
            Email: support@findyourstay.in | Website: https://rentify-nine-roan.vercel.app
          </p>
        </section>
      </div>
    </div>
  );
}

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
