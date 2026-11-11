"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import {
  CreditCard,
  Smartphone,
  QrCode,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState('bkash');

  const handleSelectMethod = (selectedId: string) => {
    setMethod(selectedId);
  };

  const handleProceedToPayment = () => {
    if (method === 'bkash') {
      router.push('/bkash-payment');
    } else if (method === 'nagad') {
      router.push('/nagad-payment');
    } else if (method === 'bangla_qr') {
      router.push('/bangla-qr-payment');
    } else if (method === 'card') {
      router.push('/card-payment');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-10"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Order Summary */}
            <div className="space-y-8">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Order Summary</h1>
                  <p className="text-slate-500 text-sm font-medium">Review your subscription upgrade details.</p>
                </div>

                <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-lg">ScholarConnect Pro</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Lifetime Access</p>
                      </div>
                      <span className="font-black text-slate-900 text-xl tracking-tighter">500 BDT</span>
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <div className="space-y-3.5">
                      {['Priority AI Tools Access', 'Unlimited SOP/CV Checks', 'Golden Verified Badge'/*, 'Direct Mentor Chat'*/].map(feat => (
                        <div key={feat} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                        </div>
                      ))}
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payable Amount</span>
                      <span className="text-2xl sm:text-3xl font-black text-primary underline decoration-primary/10 decoration-8 underline-offset-8">500 BDT</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Lock size={18} className="shrink-0 text-slate-500" />
                  <span>SSLCommerz Secure 256-bit Transaction</span>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-8">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Payment Gateway</h2>

                <div className="space-y-3.5">
                  {[
                    { id: 'bkash', name: 'bKash Checkout', icon: Smartphone, color: 'text-pink-600', sub: 'FAST & SECURE' },
                    { id: 'nagad', name: 'Nagad Pay', icon: Smartphone, color: 'text-orange-600', sub: 'POPULAR CHOICE' },
                    { id: 'bangla_qr', name: 'Bangla QR', icon: QrCode, color: 'text-emerald-600', sub: 'INSTANT SCAN' },
                    { id: 'card', name: 'Debit / Credit Card', icon: CreditCard, color: 'text-blue-600', sub: 'VISA, MASTERCARD, AMEX' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMethod(m.id)}
                      className={`w-full flex items-center justify-between p-5 border rounded-2xl transition-all group ${
                        method === m.id ? 'border-primary ring-2 ring-primary/20 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform ${m.color}`}>
                              <m.icon size={22} />
                          </div>
                          <div className="text-left">
                              <p className="font-bold text-slate-900 text-sm">{m.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{m.sub}</p>
                          </div>
                        </div>
                        {method === m.id && <CheckCircle2 size={22} className="text-primary" />}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-900/10"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={18} />
                </button>

                <div className="flex justify-center items-center gap-6 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all pt-4">
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/bkash.png" className="h-5" alt="bKash" />
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/visa.png" className="h-5" alt="Visa" />
                  <img src="https://securepay.sslcommerz.com/gw/images/brand-name/mastercard.png" className="h-5" alt="Master" />
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
