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

            {/* Light Themed Interactive Card Preview */}
            <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 text-white rounded-[2rem] p-8 shadow-xl space-y-8 overflow-hidden border border-teal-500/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-black tracking-widest uppercase text-teal-100">SCHOLARCONNECT CARD</span>
                <div className="flex items-center gap-3">
                  <Wifi size={20} className="text-teal-200" />
                  <span className="text-xs font-black bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/30">
                    VISA / MASTERCARD
                  </span>
                </div>
              </div>

              <div className="py-4 relative z-10">
                <p className="text-2xl md:text-3xl font-mono tracking-widest text-center text-white drop-shadow">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
              </div>

              <div className="flex justify-between items-end border-t border-white/20 pt-6 relative z-10">
                <div>
                  <p className="text-[9px] font-black tracking-widest text-teal-200 uppercase mb-1">CARD HOLDER</p>
                  <p className="font-bold text-sm text-white tracking-wide uppercase">
                    {cardHolder || 'YOUR NAME'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-teal-200 uppercase mb-1">EXPIRES</p>
                  <p className="font-mono font-bold text-sm text-white tracking-wide">
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
