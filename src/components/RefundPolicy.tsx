import React from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Clock,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  ArrowDownRight,
  ExternalLink,
  Lock,
  Smartphone
} from 'lucide-react';

export interface RefundPolicyProps {
  onBack?: () => void;
  isEmbedded?: boolean;
  onContactSupport?: () => void;
}

export const RefundPolicy: React.FC<RefundPolicyProps> = ({
  onBack,
  isEmbedded = false,
  onContactSupport
}) => {
  return (
    <div
      id="refund-policy-container"
      className={isEmbedded ? 'space-y-5' : 'min-h-screen bg-slate-50 text-slate-900 pb-20'}
    >
      {/* Top Header Banner (Shown only when not embedded inside an existing page) */}
      {!isEmbedded && (
        <div className="bg-gradient-to-b from-[#8B0000] via-[#A30000] to-[#B31B1B] text-white pt-4 pb-6 px-4 sm:px-6 relative shadow-md rounded-b-2xl">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            {onBack ? (
              <button
                id="btn-refund-policy-back"
                onClick={onBack}
                className="p-1.5 -ml-1 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer flex items-center gap-1.5"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-xs font-semibold sm:inline hidden">Back</span>
              </button>
            ) : (
              <div />
            )}
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-black/25 px-2.5 py-1 rounded-full border border-amber-300/30">
                Razorpay Direct Clearing
              </span>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Refund Policy
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5">
                  100% Processed Directly by Razorpay to Your Source Account
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Header Title Card */}
      {isEmbedded && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B0000] text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Payment Refund Policy
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Razorpay Direct
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full transparency on cancelled order refunds &amp; bank clearing
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={isEmbedded ? 'space-y-4' : 'max-w-3xl mx-auto px-4 sm:px-6 mt-5 space-y-5'}>
        {/* Core Direct-to-Source Notice */}
        <div
          id="refund-direct-source-box"
          className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/50">
                  Zero In-App Middleman
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500">
                  ₹0 Processing Fee
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                100% Refund Direct to Your Source Account
              </h3>
              <p>
                Our store does <strong>not</strong> withhold your refund as locked in-app store credits or wallet balance.
                When an order is cancelled within the permitted cancellation period, the refund is initiated directly via the <strong>Razorpay Payment Gateway</strong> back to the exact payment method you used (your original UPI handle, bank account, or debit/credit card).
              </p>
            </div>
          </div>
        </div>

        {/* 2-Minute Cancellation Policy Rule */}
        <div
          id="refund-window-rule"
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              The 2-Minute Cancellation Window
            </h3>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              To maintain our <strong>60-minute express Kolkata delivery</strong> commitment, orders enter live picking and warehouse packing immediately.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cancelled Within 2 Minutes
                </div>
                <p className="text-[11px] text-slate-600">
                  Full 100% refund is initiated automatically via Razorpay with ₹0 deduction. Instant confirmation is provided with a unique Razorpay Refund ID.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  After 2 Minutes
                </div>
                <p className="text-[11px] text-slate-600">
                  Once picking completes or a delivery partner is dispatched, automatic cancellation locks to prevent warehouse loss. Contact support for exceptional issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clearing Timelines by Payment Method */}
        <div
          id="refund-timelines-card"
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Razorpay Banking Clearing Timelines
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Standard Banking SLA
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            {/* UPI */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <p className="font-bold text-slate-900">UPI Instant Pay</p>
                </div>
                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM, CRED</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                  Instant – 24 Hours
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Most reflect within minutes</p>
              </div>
            </div>

            {/* Debit / Credit Cards */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <p className="font-bold text-slate-900">Debit / Credit Cards</p>
                </div>
                <p className="text-xs text-slate-500">Visa, MasterCard, RuPay (All issuing banks)</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
                  5 to 7 Working Days
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Governed by card issuer bank</p>
              </div>
            </div>

            {/* Net Banking */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <p className="font-bold text-slate-900">Net Banking</p>
                </div>
                <p className="text-xs text-slate-500">SBI, HDFC, ICICI, Axis, PNB &amp; others</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs">
                  2 to 4 Working Days
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct NEFT / IMPS bank credit</p>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-500">Payment made in cash or QR at doorstep</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                  ₹0 Charged
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Order cancelled at zero cost</p>
              </div>
            </div>
          </div>
        </div>

        {/* Razorpay Refund ID & ARN Tracking */}
        <div
          id="refund-arn-info"
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Razorpay Refund ID &amp; Bank ARN Reference
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Whenever a refund is initiated by our system, Razorpay assigns a unique <strong>Refund ID</strong> (e.g., <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">rfnd_P18xyz9482</code>) and communicates the Acquiring Bank Reference Number (ARN).
          </p>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700 space-y-2">
            <div className="flex items-start gap-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
              <span>
                <strong>Direct Notification:</strong> Razorpay sends automated SMS and email notifications directly to your registered phone number and email upon releasing funds to the banking network.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
              <span>
                <strong>Bank Branch Tracing:</strong> If your bank statement does not reflect the credit after the standard turnaround time, you can present the ARN to your bank manager for immediate tracing.
              </span>
            </div>
          </div>
        </div>

        {/* Kolkata Support Help Desk */}
        <div
          id="refund-support-card"
          className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Have Questions About a Refund?</h4>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kolkata Support Active
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our Kolkata central depot finance &amp; customer care team is available daily from 9:00 AM to 9:00 PM to assist you with transaction references or bank inquiries.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <a
              id="link-call-helpline"
              href="tel:+918777400280"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Support (+91 87774 00280)
            </a>
            {onContactSupport && (
              <button
                type="button"
                onClick={onContactSupport}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Open Help Center
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
