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
  ExternalLink,
  Lock,
  ArrowDownRight
} from 'lucide-react';

interface RefundPolicySubPageProps {
  onBack: () => void;
  onContactSupport?: () => void;
}

export const RefundPolicySubPage: React.FC<RefundPolicySubPageProps> = ({
  onBack,
  onContactSupport
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-b from-[#8B0000] via-[#A30000] to-[#B31B1B] text-white pt-4 pb-6 px-4 sm:px-6 relative shadow-md rounded-b-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer flex items-center gap-1.5"
            aria-label="Go back to profile"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-semibold sm:inline hidden">Back</span>
          </button>
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-black/20 px-2.5 py-1 rounded-full border border-amber-300/30">
              Razorpay Direct
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
                100% Managed & Processed Directly by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-5 space-y-5">
        {/* Core Direct-to-Source Notice */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/50">
                  Zero In-App Middleman
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Direct Refund Back to Your Bank / UPI / Card
              </h2>
              <p>
                Our store does <strong>not</strong> hold your refund as trapped in-app wallet balance or store credits.
                All refunds are transmitted directly through the <strong>Razorpay Payment Gateway</strong> back to the exact bank account, UPI ID, or card from which you paid.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Minute Cancellation Policy Rule */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
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
              To ensure our <strong>60-minute express Kolkata dispatch</strong>, orders enter picking and cutting immediately after confirmation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Within 2 Minutes
                </div>
                <p className="text-[11px] text-slate-600">
                  Cancel with a single tap in Order Details. 100% full refund is initiated via Razorpay with ₹0 deduction.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  After 2 Minutes
                </div>
                <p className="text-[11px] text-slate-600">
                  Once packing starts or rider is assigned, automatic cancellation locks to prevent warehouse loss.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Timelines by Payment Method */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Razorpay Clearing Timelines
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              RBI / NPCI SLA
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            {/* UPI */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">UPI Instant Pay</p>
                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM, CRED</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs">
                  Instant – 24 Hrs
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Most reflect in minutes</p>
              </div>
            </div>

            {/* Debit / Credit Cards */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Debit / Credit Cards</p>
                <p className="text-xs text-slate-500">Visa, MasterCard, RuPay cards</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
                  5 to 7 Working Days
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">As per card issuing bank</p>
              </div>
            </div>

            {/* Net Banking */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Net Banking</p>
                <p className="text-xs text-slate-500">SBI, HDFC, ICICI, Axis, PNB & others</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs">
                  2 to 4 Working Days
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct NEFT/IMPS credit</p>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="py-3 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-500">Pay at your doorstep</p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                  No Refund Needed
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">₹0 was collected</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to track Razorpay Refund ID / ARN */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Razorpay ARN & Bank Reference Tracking
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            When your order is cancelled within policy, Razorpay instantly creates a unique <strong>Refund ID</strong> (e.g. <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">rfnd_P18xyz...</code>) and Acquiring Bank Reference Number (ARN).
          </p>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-start gap-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
              <span>You receive an automated SMS and email notification from Razorpay once the refund is sent to the banking rails.</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowDownRight className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
              <span>If your bank statement does not show the credit after the standard timeline, quote the Razorpay ARN to your branch for instant tracing.</span>
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Need Assistance with a Refund?</h4>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kolkata Support Desk
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our Kolkata depot billing team is available daily 9:00 AM – 9:00 PM to help verify your payment or refund status.
          </p>
          <div className="pt-1 flex items-center gap-3">
            <a
              href="tel:+918777400280"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Helpline (+91 87774 00280)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
