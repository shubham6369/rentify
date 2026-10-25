import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Find Your Stay',
  description: 'Terms and conditions governing accommodations and reservations on Find Your Stay.'
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-xs text-slate-500">Effective as of October 23, 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 text-xs text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-wide">
            1. Booking &amp; Advance Payment Rules
          </h2>
          <p>
            By confirming a reservation on Find Your Stay:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Student Stays:</strong> Monthly rent applies. Advance payment locks your refundable security deposit. Student verification ID is mandatory prior to move-in.</li>
            <li><strong>Family Stays:</strong> 30% advance is paid at reservation time; the 70% remaining balance is payable at property check-in.</li>
            <li><strong>Trip Stays:</strong> Instant voucher issuance. 48-hour free cancellation policy applies where indicated.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            2. Cancellation & Refunds
          </h2>
          <p>
            Cancellations made within the free cancellation window receive a 100% refund of the advance payment back to the original payment source within 5-7 business days via Razorpay gateway.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            3. Contact Information
          </h2>
          <p>
            For support or disputes, reach out to legal@findyourstay.in.
          </p>
        </section>
      </div>
    </div>
  );
}
