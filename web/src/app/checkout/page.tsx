"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  Calendar,
  User,
  KeyRound
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState('card');
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

  const handlePayment = async () => {
    setErrorMsg('');

    if (method === 'card') {
      if (!cardHolder.trim() || !cardNumber || !expiry || !cvv) {
        setErrorMsg('Please fill in all card details (Cardholder Name, Card Number, Expiry, CVV).');
        return;
      }
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        setErrorMsg('Please enter a valid 16-digit card number (e.g. 4242 4242 4242 4242).');
        return;
      }
    }

    setProcessing(true);
    try {
      let backendMethod = 'DirectCard';
      if (method === 'bkash') backendMethod = 'bKash';
      else if (method === 'nagad') backendMethod = 'DirectCard';
      else if (method === 'card') backendMethod = 'DirectCard';

      const res = await apiService.initiateCheckout(backendMethod);
      if (res.ok) {
        if (res.data?.checkout_url && backendMethod === 'SSLCommerz') {
          window.location.href = res.data.checkout_url;
        } else {
          router.push('/profile');
        }
      } else {
        setErrorMsg(res.data?.error || res.data?.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during checkout.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Order Summary */}
            <div className="space-y-10">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Order Summary</h1>
                  <p className="text-slate-500 text-sm font-medium">Review your subscription upgrade details.</p>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-10 space-y-8">
                  <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-lg">ScholarConnect Pro</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">30 Days Membership</p>
                      </div>
                      <span className="font-black text-slate-900 text-xl tracking-tighter">500 BDT</span>
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <div className="space-y-4">
                      {['Priority AI Tools Access', 'Unlimited SOP/CV Checks', 'Golden Verified Badge', 'Direct Mentor Chat'].map(feat => (
                        <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            {feat}
                        </div>
                      ))}
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <div className="flex justify-between items-center pt-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payable Amount</span>
                      <span className="text-3xl font-black text-primary underline decoration-primary/10 decoration-8 underline-offset-8">500 BDT</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Lock size={18} />
                  SSLCommerz Secure 256-bit Transaction
                </div>
            </div>

            {/* Payment Methods & Card Details */}
            <div className="space-y-10">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Payment Gateway</h2>

                <div className="space-y-4">
                  {[
                    { id: 'card', name: 'Debit / Credit Card', icon: CreditCard, color: 'text-blue-600', sub: 'Visa, MasterCard, Amex' },
                    { id: 'bkash', name: 'bKash Checkout', icon: Smartphone, color: 'text-pink-600', sub: 'Fast & Secure' },
                    { id: 'nagad', name: 'Nagad Pay', icon: Smartphone, color: 'text-orange-600', sub: 'Popular Choice' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`w-full flex items-center justify-between p-6 border rounded-[1.5rem] transition-all group ${
                        method === m.id ? 'border-primary ring-4 ring-primary/5 bg-slate-50/50' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${m.color}`}>
                              <m.icon size={24} />
                          </div>
                          <div className="text-left">
                              <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.sub}</p>
                          </div>
                        </div>
                        {method === m.id && <CheckCircle2 size={24} className="text-primary" />}
                    </button>
                  ))}
                </div>

                {/* Card Details Form when 'card' is selected */}
                {method === 'card' && (
                  <div className="bg-slate-900 text-white p-6 rounded-[2rem] space-y-5 shadow-xl">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Card Details</span>
                      <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-1 rounded font-bold">VISA / MC</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Cardholder Name</label>
                        <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                          <User size={18} className="text-slate-400 mr-3" />
                          <input
                            type="text"
                            placeholder="e.g. RAHIM AHMED"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                            className="bg-transparent text-white placeholder-slate-500 text-sm font-medium w-full focus:outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Card Number</label>
                        <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                          <CreditCard size={18} className="text-slate-400 mr-3" />
                          <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            className="bg-transparent text-white placeholder-slate-500 text-sm font-mono tracking-wider w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Expiry Date</label>
                          <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                            <Calendar size={18} className="text-slate-400 mr-3" />
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={expiry}
                              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                              className="bg-transparent text-white placeholder-slate-500 text-sm font-mono w-full focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">CVV</label>
                          <div className="flex items-center bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
                            <KeyRound size={18} className="text-slate-400 mr-3" />
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={3}
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                              className="bg-transparent text-white placeholder-slate-500 text-sm font-mono w-full focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {errorMsg ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600">
                    {errorMsg}
                  </div>
                ) : null}

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-300 disabled:opacity-50"
                >
                  {processing ? 'Processing Payment...' : method === 'card' ? 'Pay 500 BDT & Activate Pro' : 'Proceed to Checkout'}
                  <ArrowRight size={20} />
                </button>

                <div className="flex justify-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all pt-6">
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/visa.png" className="h-6" alt="Visa" />
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/mastercard.png" className="h-6" alt="Master" />
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/bkash.png" className="h-6" alt="bKash" />
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
