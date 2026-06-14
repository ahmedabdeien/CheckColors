import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiCheck, FiZap } from 'react-icons/fi';

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
      toast.error(err.response?.data?.message || 'خطأ في المعالجة');
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = user?.subscription?.plan || 'free';

  return (
    <div className="min-h-screen bg-slate-950 text-white py-16 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">اختر خطتك</h1>
          <p className="text-slate-400 text-lg">ابدأ مجاناً، وارتقِ عندما تحتاج المزيد</p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-xl p-1 mt-6">
            {['monthly', 'yearly'].map(i => (
              <button key={i} onClick={() => setInterval(i)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition ${interval === i ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {i === 'monthly' ? 'شهري' : 'سنوي'}{i === 'yearly' && <span className="mr-1.5 text-xs text-green-400">وفر 20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const price = plan.price[interval];
            return (
              <div key={plan.id} className={`relative rounded-2xl border p-8 ${plan.popular ? 'border-indigo-500 bg-indigo-950/30' : 'border-white/10 bg-white/5'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                      <FiZap size={10} /> الأكثر شعبية
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  {price === 0 ? (
                    <span className="text-4xl font-black">مجاني</span>
                  ) : (
                    <>
                      <span className="text-4xl font-black">${price}</span>
                      <span className="text-slate-400 text-sm">/شهر</span>
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || loading === plan.id || plan.id === 'free'}
                  className={`w-full py-3 rounded-xl font-medium transition ${
                    isCurrent
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30 cursor-default'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : plan.id === 'free'
                      ? 'bg-white/10 text-slate-400 cursor-default'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}>
                  {loading === plan.id ? 'جارٍ المعالجة...' : isCurrent ? '✓ خطتك الحالية' : plan.id === 'free' ? 'مجاني دائماً' : 'اشترك الآن'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-500 text-sm mt-10">
          جميع المدفوعات آمنة عبر Stripe • يمكنك الإلغاء في أي وقت
        </p>
      </div>
    </div>
  );
}
