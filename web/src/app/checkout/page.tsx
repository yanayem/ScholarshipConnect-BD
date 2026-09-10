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
  Lock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [method, setMethod] = useState('bkash');
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    setProcessing(true);
    // Simulate payment gateway redirect
    setTimeout(() => {
      alert('Redirecting to SSLCommerz Gateway...');
      router.push('/profile');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-10"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
           {/* Order Summary */}
           <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Summary</h1>
                <p className="text-slate-500 text-sm font-medium">Complete your upgrade to Pro.</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                       <h4 className="font-bold text-slate-900">ScholarConnect Pro</h4>
                       <p className="text-xs text-slate-500 font-medium">30 Days Subscription</p>
                    </div>
                    <span className="font-black text-slate-900">500 BDT</span>
                 </div>

                 <div className="h-px bg-slate-200"></div>

                 <div className="space-y-3">
                    {['Priority AI Tools', 'Unlimited SOP Checks', 'Verified Badge', 'Direct Mentor Chat'].map(feat => (
                       <div key={feat} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          {feat}
                       </div>
                    ))}
                 </div>

                 <div className="h-px bg-slate-200"></div>

                 <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-primary underline decoration-primary/20 decoration-4">500 BDT</span>
                 </div>
              </div>

              <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 <Lock size={16} />
                 SSLCommerz Secure Transaction
              </div>
           </div>

           {/* Payment Methods */}
           <div className="space-y-8">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select Payment Method</h2>

              <div className="space-y-4">
                 {[
                   { id: 'bkash', name: 'bKash', icon: Smartphone, color: 'text-pink-600' },
                   { id: 'nagad', name: 'Nagad', icon: Smartphone, color: 'text-orange-600' },
                   { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-600' }
                 ].map(m => (
                   <button
                     key={m.id}
                     onClick={() => setMethod(m.id)}
                     className={`w-full flex items-center justify-between p-6 border rounded-[1.5rem] transition-all ${
                       method === m.id ? 'border-primary ring-2 ring-primary/10 bg-slate-50' : 'border-slate-100 hover:border-slate-200'
                     }`}
                   >
                      <div className="flex items-center gap-4">
                         <m.icon size={24} className={m.color} />
                         <span className="font-bold text-slate-900">{m.name}</span>
                      </div>
                      {method === m.id && <CheckCircle2 size={20} className="text-primary" />}
                   </button>
                 ))}
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                 {processing ? 'Processing Securely...' : 'Pay Now 500 BDT'}
                 <ArrowRight size={20} />
              </button>

              <div className="flex justify-center gap-4 opacity-50 grayscale pt-4">
                 <img src="https://securepay.sslcommerz.com/gw/images/brand-name/visa.png" className="h-6" alt="Visa" />
                 <img src="https://securepay.sslcommerz.com/gw/images/brand-name/mastercard.png" className="h-6" alt="Master" />
                 <img src="https://securepay.sslcommerz.com/gw/images/brand-name/bkash.png" className="h-6" alt="bKash" />
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
