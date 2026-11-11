"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ArrowLeft, CheckCircle2, ShieldCheck, QrCode, RefreshCw, AlertCircle, Copy, Check, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function BanglaQRPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [errorMsg, setErrorMsg] = useState('');

  const merchantCode = '01700000000.SCBD';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyMerchant = () => {
    navigator.clipboard.writeText(merchantCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiService.initiateCheckout('BanglaQR');
      if (res.ok) {
        router.push('/profile');
      } else {
        setErrorMsg(res.data?.error || res.data?.message || 'Payment verification failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Error verifying Bangla QR payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70">
      <Header />

      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-xs font-black uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={16} />
          Back to Checkout
        </button>

        {/* Bangla QR Container */}
        <div className="bg-[#00965E] rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-700">
          {/* Bangla QR Header */}
          <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner text-[#00965E]">
                <QrCode size={28} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">Bangla QR Instant Pay</h1>
                <p className="text-xs text-emerald-100 font-medium">National Interoperable QR Gateway</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Payable Amount</p>
              <p className="text-xl sm:text-2xl font-black text-white tracking-tight">500.00 BDT</p>
            </div>
          </div>

          {/* Countdown Header */}
          <div className="bg-emerald-900/40 px-6 py-3 border-b border-white/10 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-emerald-100">
            <span>Bangladesh Bank Standard</span>
            <div className="flex items-center gap-2 text-yellow-300">
              <Clock size={14} />
              <span>Expires in: {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="p-6 sm:p-10 bg-white text-slate-800 space-y-8">
            <div className="max-w-md mx-auto text-center space-y-6">
              {/* Dynamic QR Display */}
              <div className="bg-slate-50 border-2 border-emerald-500/20 p-6 rounded-[2rem] shadow-inner inline-block relative">
                <div className="w-56 h-56 mx-auto bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative shadow-sm">
                  {/* Generated SVG QR Pattern */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Corners */}
                    <path d="M5 5h30v30H5zM10 10v20h20V10zM15 15h10v10H15z" />
                    <path d="M65 5h30v30H65zM70 10v20h20V10zM75 15h10v10H75z" />
                    <path d="M5 65h30v30H5zM10 70v20h20V70zM15 75h10v10H15z" />
                    {/* Random QR Pattern Grid */}
                    <path d="M40 5h10v10H40zM55 10h10v5H55zM45 20h20v5H45zM40 30h15v5H40zM5 40h10v10H5zM20 40h15v5H20zM40 40h5v15H40zM50 45h20v5H50zM75 40h20v10H75zM80 55h15v10H80zM60 65h10v20H60zM75 75h10v20H75zM40 70h15v10H40zM45 85h20v10H45zM20 50h10v10H20zM30 60h10v10H30z" />
                  </svg>
                  {/* Badge Center Logo */}
                  <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-xl border-2 border-[#00965E] flex items-center justify-center text-[#00965E] font-black text-[9px] shadow-md">
                    বাংলা QR
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Merchant Code:</span>
                  <span className="font-mono font-black text-slate-900 text-xs">{merchantCode}</span>
                  <button
                    onClick={handleCopyMerchant}
                    className="p-1 text-slate-400 hover:text-[#00965E] transition-colors"
                    title="Copy Merchant Code"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">Scan with Any Banking App</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Open your <span className="font-bold text-[#00965E]">bKash, Nagad, Rocket, CellFin, Citytouch, Upay</span> or any BD bank app and scan this QR code.
                </p>
              </div>

              {/* Supported App Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['bKash', 'Nagad', 'Rocket', 'CellFin', 'Citytouch', 'Upay', 'Islami Bank'].map(app => (
                  <span key={app} className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600">
                    {app}
                  </span>
                ))}
              </div>

              {errorMsg ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full py-5 bg-[#00965E] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#007d4e] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Verifying Transaction...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>I Have Scanned & Paid</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                >
                  Cancel Transaction
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Bangladesh Bank Interoperable Standard</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-slate-500">
                <span>Instant Auto Verification</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
