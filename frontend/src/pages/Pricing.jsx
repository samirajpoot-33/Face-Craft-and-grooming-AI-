import React, { useState } from 'react';
import { Check, Zap, Crown, Coins, ArrowRight, Star } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import CheckoutModal from '../components/CheckoutModal';

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: '$0',
      description: 'Perfect for trying out FaceCraft AI',
      features: [
        '5 Free Credits',
        'Basic Face Shape Analysis',
        'Community Support',
        'Standard Result Export'
      ],
      buttonText: 'Current Plan',
      isPopular: false,
      color: 'from-slate-500 to-slate-700'
    },
    {
      id: 'pro',
      name: 'Pro Credits',
      price: '$9.99',
      description: 'For power users needing more results',
      features: [
        '50 AI Credits',
        'Priority Processing',
        'Advanced Skin Metrics',
        'Full History Access',
        'Social Media Card Export'
      ],
      buttonText: 'Purchase Credits',
      isPopular: true,
      color: 'from-sky-500 to-indigo-600',
      amount: 50
    },
    {
      id: 'premium',
      name: 'Lifetime Premium',
      price: '$29.99',
      description: 'Unlimited access forever',
      features: [
        'Unlimited AI Analysis',
        'Early Access to New Models',
        'Ad-Free Experience',
        'Premium Hairstyle Library',
        'Expert Virtual Consultations'
      ],
      buttonText: 'Go Premium',
      isPopular: false,
      color: 'from-amber-400 to-orange-500',
      isPremium: true
    }
  ];

  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [checkoutData, setCheckoutData] = useState({ checkoutUrl: '', qrCodeUrl: '', merchantTradeNo: '' });

  const handleAction = async (plan) => {
    if (plan.id === 'free') return;
    
    setLoadingPlan(plan.id);
    // Simulate network delay for UI feedback
    setTimeout(() => {
      setCheckoutPlan(plan);
      setLoadingPlan(false);
    }, 500);
  };

  const handlePaymentSuccess = (data) => {
    setCheckoutPlan(null);
    setCheckoutData({ checkoutUrl: '', qrCodeUrl: '', merchantTradeNo: '' });
    alert(data.message || 'Payment successful!');
    window.location.reload();
  };

  function getBackendOrigin() {
    return window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
  }

  return (
    <div className="relative min-h-screen pt-32 pb-24 overflow-hidden bg-slate-950">
      {/* Premium Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sky-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Star size={14} className="fill-sky-400" />
              Upgrade Your Experience
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Transparent</span> Pricing
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Unlock the full power of FaceCraft AI. Choose the plan that fits your grooming journey.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.id} delay={index * 0.1}>
              <div className={`relative h-full p-8 rounded-[32px] bg-white/5 border transition-all duration-500 hover:-translate-y-2 group ${plan.isPopular ? 'border-sky-500 shadow-[0_0_40px_rgba(56,189,248,0.15)]' : 'border-white/10'}`}>
                
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sky-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/40">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    {plan.id !== 'premium' && <span className="text-slate-500 text-sm">/one-time</span>}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-slate-300 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-emerald-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleAction(plan)}
                  disabled={plan.id === 'free' || loadingPlan}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
                    ${plan.id === 'free' 
                      ? 'bg-slate-800 text-slate-400 cursor-default' 
                      : `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                >
                  {loadingPlan === plan.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {plan.buttonText}
                      {plan.id !== 'free' && <ArrowRight size={16} />}
                    </>
                  )}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-[40px] bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-white/5 text-center">
          <ScrollReveal>
            <div className="flex justify-center mb-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-sky-500 flex items-center justify-center text-xs font-bold text-white">
                  +2k
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Join 2,000+ stylish individuals</h3>
            <p className="text-slate-400 max-w-xl mx-auto">
              Our Pro users report a 40% increase in grooming satisfaction after following their bespoke AI protocols.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <CheckoutModal
        plan={checkoutPlan}
        checkoutUrl={checkoutData.checkoutUrl}
        qrCodeUrl={checkoutData.qrCodeUrl}
        merchantTradeNo={checkoutData.merchantTradeNo}
        onClose={() => {
          setCheckoutPlan(null);
          setCheckoutData({ checkoutUrl: '', qrCodeUrl: '', merchantTradeNo: '' });
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}