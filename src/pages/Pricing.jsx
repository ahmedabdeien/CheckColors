import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FaCheck, FaBolt, FaArrowRight, FaCrown, FaRocket } from 'react-icons/fa6';

const PLAN_ICONS = { free: FaCheck, pro: FaCrown, enterprise: FaRocket };

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
    <div className="min-h-screen bg-gray-50 py-16 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">الأسعار</span>
          <h1 className="text-4xl font-black text-gray-800 mb-4">اختر الخطة المناسبة لك</h1>
          <p className="text-gray-500 text-lg">ابدأ مجاناً، وارتقِ عندما تحتاج المزيد من القوة</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 mt-6 shadow-sm">
            {[['monthly','شهري'], ['yearly','سنوي']].map(([val, label]) => (
              <button key={val} onClick={() => setInterval(val)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${interval === val ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
                {val === 'yearly' && <span className="mr-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">وفر 20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const price = plan.price[interval];
            const Icon = PLAN_ICONS[plan.id] || FaCheck;
            const isPopular = plan.popular;

            return (
              <div key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col transition ${
                  isPopular ? 'border-blue-500 shadow-xl shadow-blue-100' : 'border-gray-100 shadow-sm hover:border-gray-200'
                }`}>
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                      <FaBolt className="text-xs" /> الأكثر شعبية
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  isPopular ? 'bg-blue-600' : 'bg-gray-100'
                }`}>
                  <Icon className={`text-xl ${isPopular ? 'text-white' : 'text-gray-600'}`} />
                </div>

                <h3 className="text-xl font-black text-gray-800 mb-1">{plan.name}</h3>

                <div className="mb-6">
                  {price === 0 ? (
                    <div className="text-4xl font-black text-gray-800">مجاني</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-gray-800">${price}</span>
                      <span className="text-gray-400 text-sm">/شهر</span>
                    </div>
                  )}
                  {interval === 'yearly' && price > 0 && (
                    <p className="text-green-600 text-xs mt-1 font-medium">يُدفع سنوياً — توفر 20%</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPopular ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <FaCheck className={`text-[10px] ${isPopular ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>

                <button onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || loading === plan.id || plan.id === 'free'}
                  className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-default'
                      : isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
                      : plan.id === 'free'
                      ? 'bg-gray-100 text-gray-500 cursor-default'
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}>
                  {loading === plan.id ? (
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isCurrent ? (
                    <><FaCheck /> خطتك الحالية</>
                  ) : plan.id === 'free' ? (
                    'مجاني دائماً'
                  ) : (
                    <><span>اشترك الآن</span><FaArrowRight className="text-sm" /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-10">
          <FaCheck className="inline ml-1 text-green-500" />
          جميع المدفوعات آمنة عبر Stripe • يمكنك الإلغاء في أي وقت • لا رسوم خفية
        </p>
      </div>
    </div>
  );
}
