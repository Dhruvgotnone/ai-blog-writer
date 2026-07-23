// src/components/PricingModal.js
import React, { useState } from 'react';
import { X, Check, Zap, Crown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free Starter',
    price: '$0',
    period: 'forever',
    credits: '5 Credits',
    icon: Zap,
    color: 'border-ink-200 dark:border-ink-700',
    features: ['5 Free Generation Credits', 'Mistral-7B & GPT-2 Models', 'Standard Generation Speed', 'Community Support'],
  },
  {
    id: 'pro',
    name: 'Pro Publisher',
    price: '$15',
    period: '/month',
    credits: '100 Credits / mo',
    icon: Crown,
    popular: true,
    color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20',
    features: ['100 AI Generation Credits', 'AI Cover Image Generation', 'All Models (Mistral, Zephyr, Falcon)', 'Multi-Language Support', 'Social Media Repurposer', 'Priority Support'],
  },
  {
    id: 'agency',
    name: 'Agency & Team',
    price: '$49',
    period: '/month',
    credits: '500 Credits / mo',
    icon: Shield,
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20',
    features: ['500 AI Generation Credits', 'HD AI Image Generation', 'Custom Outline Builder', 'Direct CMS Publishing', 'Dedicated Support & API Access'],
  },
];

const PricingModal = ({ isOpen, onClose }) => {
  const { user, addCredits } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan) => {
    if (!user) {
      toast.error('Please login or register to upgrade your plan.');
      return;
    }

    if (plan.id === 'free') {
      toast.success('You are currently on the Free plan!');
      return;
    }

    setLoadingPlan(plan.id);
    const creditAmount = plan.id === 'pro' ? 50 : 250;
    const res = await addCredits(creditAmount, plan.id);
    setLoadingPlan(null);

    if (res.success) {
      toast.success(res.message);
      onClose();
    } else {
      toast.error(res.error || 'Upgrade failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-ink-900 rounded-2xl shadow-2xl border border-ink-200 dark:border-ink-800 p-6 md:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 rounded-full hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 mb-3">
            <Zap className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-ink-900 dark:text-ink-100 font-serif">
            Upgrade Your Inkwell AI Plan
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-2">
            Get more generation credits, HD AI cover photos, multi-language support, and social media repurposing tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentTier = user?.tier === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-6 border-2 transition-all flex flex-col justify-between ${plan.color}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-500 text-ink-950 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-ink-900 dark:text-ink-100 text-lg">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-extrabold text-ink-900 dark:text-ink-100 font-serif">{plan.price}</span>
                    <span className="text-xs text-ink-500 dark:text-ink-400">{plan.period}</span>
                  </div>

                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-4">
                    ⚡ {plan.credits}
                  </p>

                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-600 dark:text-ink-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loadingPlan === plan.id || isCurrentTier}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md ${
                    isCurrentTier
                      ? 'bg-emerald-600 text-white cursor-default'
                      : plan.popular
                      ? 'bg-amber-500 hover:bg-amber-600 text-ink-950'
                      : 'bg-ink-900 dark:bg-ink-700 hover:bg-ink-800 dark:hover:bg-ink-600 text-white'
                  } disabled:opacity-75`}
                >
                  {isCurrentTier
                    ? 'Current Active Plan'
                    : loadingPlan === plan.id
                    ? 'Upgrading...'
                    : plan.id === 'free'
                    ? 'Default Plan'
                    : `Get ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default PricingModal;
