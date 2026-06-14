import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaCheck, FaBolt, FaArrowRight, FaCrown, FaRocket, FaXmark } from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const PLAN_ICON = { free: FaCheck, pro: FaCrown, enterprise: FaRocket };

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    api.get('/subscriptions/plans').then(r => setPlans(r.data.plans));
  }, []);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/register');
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const { data } = await api.post('/subscriptions/checkout', { plan: planId, interval });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment error');
    } finally { setLoading(null); }
  };

  const currentPlan = user?.subscription?.plan || 'free';

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>Pricing</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: LI_TEXT }}>
            Choose the right plan for you
          </h1>
          <p className="text-base mb-7" style={{ color: LI_MUTED }}>
            Start free and upgrade when you need more power
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1" style={{ border: `1px solid ${LI_BORDER}` }}>
            {[['monthly', 'Monthly'], ['yearly', 'Annually']].map(([val, label]) => (
              <button key={val} onClick={() => setInterval(val)}
                className="px-5 py-2 rounded-md text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: interval === val ? LI_BLUE : 'transparent',
                  color: interval === val ? '#fff' : LI_MUTED,
                }}>
                {label}
                {val === 'yearly' && (
                  <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#F0FFF6', color: '#057642' }}>Save 20%</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const price = plan.price[interval];
            const Icon = PLAN_ICON[plan.id] || FaCheck;
            const isPopular = plan.popular;

            return (
              <div key={plan.id} className="relative bg-white rounded-xl flex flex-col"
                style={{
                  border: `${isPopular ? '2px' : '1px'} solid ${isPopular ? LI_BLUE : LI_BORDER}`,
                  boxShadow: isPopular ? `0 0 0 1px ${LI_BLUE}20` : 'none',
                }}>

                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 text-xs font-bold px-4 py-1 rounded-full text-white"
                      style={{ backgroundColor: LI_BLUE }}>
                      <FaBolt className="text-[9px]" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6 border-b" style={{ borderColor: LI_BORDER }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: isPopular ? '#EEF3F8' : '#F3F2EF' }}>
                      <Icon className="text-sm" style={{ color: isPopular ? LI_BLUE : LI_MUTED }} />
                    </div>
                    <h3 className="font-bold text-lg" style={{ color: LI_TEXT }}>{plan.name}</h3>
                  </div>

                  {price === 0 ? (
                    <div className="text-3xl font-bold" style={{ color: LI_TEXT }}>Free</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold" style={{ color: LI_TEXT }}>${price}</span>
                      <span className="text-sm" style={{ color: LI_MUTED }}>/mo</span>
                    </div>
                  )}
                  {interval === 'yearly' && price > 0 && (
                    <p className="text-xs mt-1 font-medium" style={{ color: '#057642' }}>Billed annually — 20% off</p>
                  )}
                </div>

                <div className="p-6 flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: isPopular ? '#EEF3F8' : '#F3F2EF' }}>
                          <FaCheck className="text-[9px]" style={{ color: isPopular ? LI_BLUE : LI_MUTED }} />
                        </div>
                        <span style={{ color: LI_MUTED }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 pt-0">
                  <button onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || loading === plan.id || plan.id === 'free'}
                    className="w-full py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{
                      backgroundColor: isCurrent ? '#F0FFF6' : isPopular ? LI_BLUE : plan.id === 'free' ? '#F3F2EF' : '#000000E6',
                      color: isCurrent ? '#057642' : plan.id === 'free' ? LI_MUTED : '#fff',
                      cursor: (isCurrent || plan.id === 'free') ? 'default' : 'pointer',
                    }}
                    onMouseEnter={e => { if (!isCurrent && plan.id !== 'free' && loading !== plan.id) e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                    {loading === plan.id ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCurrent ? (
                      <><FaCheck /> Current plan</>
                    ) : plan.id === 'free' ? (
                      'Free forever'
                    ) : (
                      <><span>Get {plan.name}</span><FaArrowRight className="text-xs" /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <p className="text-xs flex items-center justify-center gap-1.5" style={{ color: LI_MUTED }}>
            <FaCheck className="text-green-500" />
            Secure payments via Stripe · Cancel anytime · No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}
