"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import {
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Calendar,
  User,
  KeyRound,
  Wifi
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function CardPaymentPage() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cardHolder.trim() || !cardNumber || !expiry || !cvv) {
      setErrorMsg('Please fill in all card details correctly.');
      return;
    }

    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.length < 16) {
      setErrorMsg('Please enter a valid 16-digit card number (e.g. 4242 4242 4242 4242).');
      return;
    }

    setProcessing(true);
    try {
      const res = await apiService.initiateCheckout('DirectCard');
      if (res.ok) {
        router.push('/profile');
      } else {
        setErrorMsg(res.data?.error || res.data?.message || 'Card payment processing failed.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred during payment.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-10"
          >
            <ArrowLeft size={16} />
            Back to Checkout
          </button>

          <div className="max-w-xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Card Payment</h1>
              <p className="text-slate-500 text-sm font-medium">Enter your Debit or Credit Card details securely.</p>
            </div>

            {/* Golden Shade Interactive Card Preview */}
            <div className="relative bg-gradient-to-br from-[#FFD043] via-[#F7B600] to-[#D59800] text-slate-950 rounded-[2rem] p-8 shadow-xl shadow-[#F7B600]/20 space-y-8 overflow-hidden border border-[#F7B600]/60">
              {/* Global World Map Shadow / Watermark */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20 bg-center bg-no-repeat bg-contain"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 500' fill='%231a1000'%3E%3Cpath d='M150 120c15-20 45-20 60-5 25 10 35-10 60 5 15 25 5 45-10 65-15 10-35 5-45 25-10 2-25-15-35-10-15-25-25-50-30-80zm45 130c20 5 35 25 40 45 10 35 5 70-15 100-15 20-25 45-20 70-10-15-25-15-30-35-15-30-5-60 10-90 10-30 5-60 15-90zm180-140c20-20 50-35 80-25 35 10 70 5 100 25 30 15 65 10 95 30 20 20 15 45 35 65 15 25 45 35 60 60 25 35 5 75 15 110-15 10-35 5-50 20-30-5-55-25-85-30-35 15-70 10-105-5-25-20-45-45-75-60-25-35-50-65-70-105-10-30 5-60-5-85zm360 230c25-15 55-15 80 0 25 20 30 50 15 75-20 25-55 25-80 10-25-20-30-55-15-85zm-480 80c10-15 30-15 40 0 15 15 10 35-5 45-15 10-35 5-40-10-5-15 0-25 5-35z'/%3E%3Cpath d='M720 150c15-10 35 0 45 15 10 20 0 40-15 45-20 5-35-10-40-30-5-15 0-25 10-30zm-270 20c20-10 45 5 50 25 5 25-10 45-30 50-25 5-45-10-50-30-5-25 10-40 30-45zm-160-50c15-5 30 5 35 20 5 20-5 35-20 40-20 5-35-5-40-20-5-20 10-35 25-40z'/%3E%3C/svg%3E")`
                }}
              />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-700/20 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-black tracking-widest uppercase text-amber-950/80">SCHOLARCONNECT PRO CARD</span>
                <div className="flex items-center gap-3">
                  <Wifi size={20} className="text-amber-950/70" />
                  <span className="text-xs font-black bg-amber-950/10 backdrop-blur-md text-amber-950 px-3 py-1 rounded-full border border-amber-950/20">
                    VISA / MASTERCARD
                  </span>
                </div>
              </div>

              <div className="py-4 relative z-10">
                <p className="text-2xl md:text-3xl font-mono font-bold tracking-widest text-center text-amber-950 drop-shadow-sm">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-amber-950/15 pt-6 relative z-10">
                <div>
                  <p className="text-[9px] font-black tracking-widest text-amber-900/70 uppercase mb-1">CARD HOLDER</p>
                  <p className="font-black text-sm text-amber-950 tracking-wide uppercase">
                    {cardHolder || 'YOUR NAME'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-amber-900/70 uppercase mb-1">EXPIRES</p>
                  <p className="font-mono font-black text-sm text-amber-950 tracking-wide">
                    {expiry || 'MM/YY'}
                  </p>
                </div>
              </div>
            </div>

            {/* Clean Light Input Form */}
            <form onSubmit={handleCardPayment} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Cardholder Name *</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <User size={20} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Full name on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="bg-transparent text-slate-900 placeholder-slate-400 text-sm font-semibold w-full focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Card Number *</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <CreditCard size={20} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="bg-transparent text-slate-900 placeholder-slate-400 text-sm font-mono tracking-wider w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">Expiry Date *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                    <Calendar size={20} className="text-slate-400 mr-3" />
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className="bg-transparent text-slate-900 placeholder-slate-400 text-sm font-mono w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">CVV *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus-within:border-teal-600 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                    <KeyRound size={20} className="text-slate-400 mr-3" />
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="bg-transparent text-slate-900 placeholder-slate-400 text-sm font-mono w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {errorMsg ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600">
                  {errorMsg}
                </div>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-teal-600/20 disabled:opacity-50"
                >
                  {processing ? 'Processing Payment...' : 'Pay 500 BDT & Unlock Pro'}
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">
                <Lock size={16} className="text-emerald-500" />
                256-Bit SSL Encrypted & Secured Transaction
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
