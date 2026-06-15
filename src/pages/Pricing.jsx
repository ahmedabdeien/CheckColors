import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  FaCheck, FaBolt, FaArrowRight, FaCrown, FaRocket,
  FaInfinity, FaLock, FaUsers, FaHeadset, FaCode,
  FaChevronDown, FaChevronUp,
} from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const PLAN_COLORS = {
  free:       { icon: FaCheck,  accent: '#868E96', bg: '#F3F2EF' },
  pro:        { icon: FaCrown,  accent: LI_BLUE,   bg: '#EEF3F8' },
  enterprise: { icon: FaRocket, accent: '#5B4FE8', bg: '#F3F0FF' },
};

// Static feature comparison table
const COMPARE_ROWS = [
  { feature: 'Palettes',        free: '10',      pro: 'Unlimited',  enterprise: 'Unlimited',  proIcon: FaInfinity, entIcon: FaInfinity },
  { feature: 'AI Generations',  free: '5/mo',    pro: '100/mo',     enterprise: 'Unlimited',  entIcon: FaInfinity },
  { feature: 'Color Library',   free: true,      pro: true,         enterprise: true },
  { feature: 'Contrast Checker',free: true,      pro: true,         enterprise: true },
  { feature: 'Image to Palette',free: true,      pro: true,         enterprise: true },
  { feature: 'Export (CSS/SCSS/TW)', free: false, pro: true,        enterprise: true },
  { feature: 'API Access',      free: false,     pro: false,        enterprise: true },
  { feature: 'Team Members',    free: '1',       pro: '1',          enterprise: 'Unlimited',  entIcon: FaInfinity },
  { feature: 'Priority Support',free: false,     pro: true,         enterprise: true },
  { feature: 'Custom Dashboard',free: false,     pro: false,        enterprise: true },
  { feature: '24/7 Dedicated Support', free: false, pro: false,     enterprise: true },
];

function CompareCell({ value, accent }) {
  if (value === true)  return <FaCheck size={14} style={{ color: '#057642', margin: '0 auto' }} />;
  if (value === false) return <span style={{ color: '#E0DFDC', fontSize: 18, lineHeight: 1 }}>—</span>;
  return <span className="text-xs font-semibold" style={{ color: accent }}>{value}</span>;
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-0" style={{ borderColor: LI_BORDER }}>
      <button className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen(o => !o)}>
        <span className="text-sm font-semibold" style={{ color: LI_TEXT }}>{q}</span>
        {open ? <FaChevronUp size={12} style={{ color: LI_MUTED, flexShrink: 0 }} />
               : <FaChevronDown size={12} style={{ color: LI_MUTED, flexShrink: 0 }} />}
      </button>
      {open && <p className="text-sm pb-4" style={{ color: LI_MUTED }}>{a}</p>}
    </div>
  );
}

export default function Pricing() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    api.get('/subscriptions/plans').then(r => setPlans(r.data.plans)).catch(() => {});
  }, []);

  const handleSubscribe = async (planId) => {
    if (!user) return navigate('/register');
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const { data } = await api.post('/subscriptions/checkout', { plan: planId, interval: billingInterval });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment error');
    } finally { setLoading(null); }
  };

  const currentPlan = user?.subscription?.plan || 'free';

  const faqs = [
    { q: t('pricing.faq1q'), a: t('pricing.faq1a') },
    { q: t('pricing.faq2q'), a: t('pricing.faq2a') },
    { q: t('pricing.faq3q'), a: t('pricing.faq3a') },
    { q: t('pricing.faq4q'), a: t('pricing.faq4a') },
  ];

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>{t('pricing.badge')}</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: LI_TEXT }}>
            {t('pricing.headline')}
          </h1>
          <p className="text-base mb-7" style={{ color: LI_MUTED }}>{t('pricing.subtext')}</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white rounded-xl p-1" style={{ border: `1px solid ${LI_BORDER}` }}>
            {[['monthly', t('pricing.monthly')], ['yearly', t('pricing.yearly')]].map(([val, label]) => (
              <button key={val} onClick={() => setBillingInterval(val)}
                className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  backgroundColor: billingInterval === val ? LI_BLUE : 'transparent',
                  color: billingInterval === val ? '#fff' : LI_MUTED,
                }}>
                {label}
                {val === 'yearly' && (
                  <span className="ms-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: billingInterval === val ? 'rgba(255,255,255,0.25)' : '#F0FFF6', color: billingInterval === val ? '#fff' : '#057642' }}>
                    {t('pricing.save')}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const price = plan.price[billingInterval];
            const { icon: Icon, accent, bg } = PLAN_COLORS[plan.id] || PLAN_COLORS.free;
            const isPopular = plan.popular;
            const isEnterprise = plan.id === 'enterprise';

            return (
              <div key={plan.id} className="relative bg-white rounded-2xl flex flex-col transition-shadow hover:shadow-md"
                style={{
                  border: `${isPopular ? '2px' : '1px'} solid ${isPopular ? LI_BLUE : isEnterprise ? '#5B4FE8' : LI_BORDER}`,
                }}>

                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="flex items-center gap-1 text-xs font-bold px-4 py-1 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: LI_BLUE }}>
                      <FaBolt size={9} /> {t('pricing.mostPopular')}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: LI_BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: bg }}>
                    <Icon size={16} style={{ color: accent }} />
                  </div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: LI_TEXT }}>{plan.name}</h3>

                  {price === 0 ? (
                    <div className="text-3xl font-bold" style={{ color: LI_TEXT }}>
                      {t('pricing.free')}
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold" style={{ color: LI_TEXT }}>${price}</span>
                      <span className="text-sm" style={{ color: LI_MUTED }}>
                        {billingInterval === 'yearly' ? t('pricing.perYear') : t('pricing.perMonth')}
                      </span>
                    </div>
                  )}
                  {billingInterval === 'yearly' && price > 0 && (
                    <p className="text-xs mt-1 font-medium" style={{ color: '#057642' }}>
                      Billed annually — 20% off
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="p-6 flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: bg }}>
                          <FaCheck size={8} style={{ color: accent }} />
                        </div>
                        <span style={{ color: LI_MUTED }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrent || loading === plan.id || plan.id === 'free'}
                    className="w-full py-2.5 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{
                      backgroundColor: isCurrent ? '#F0FFF6' : plan.id === 'enterprise' ? '#5B4FE8' : isPopular ? LI_BLUE : '#F3F2EF',
                      color: isCurrent ? '#057642' : plan.id === 'free' ? LI_MUTED : '#fff',
                      cursor: (isCurrent || plan.id === 'free') ? 'default' : 'pointer',
                    }}>
                    {loading === plan.id ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isCurrent ? (
                      <><FaCheck size={11} /> {t('pricing.currentPlan')}</>
                    ) : plan.id === 'free' ? (
                      t('pricing.getStarted')
                    ) : plan.id === 'enterprise' ? (
                      <>{t('pricing.contactSales')} <FaArrowRight size={11} /></>
                    ) : (
                      <>{t('pricing.upgrade')} <FaArrowRight size={11} /></>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust line */}
        <div className="text-center mb-12">
          <p className="text-xs flex items-center justify-center gap-2 flex-wrap" style={{ color: LI_MUTED }}>
            <span className="flex items-center gap-1"><FaLock size={10} style={{ color: '#057642' }} /> Secure payments via Stripe</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>No hidden fees</span>
            <span>·</span>
            <span>7-day money-back guarantee</span>
          </p>
        </div>

        {/* Feature comparison toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowCompare(o => !o)}
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#fff', border: `1px solid ${LI_BORDER}`, color: LI_BLUE }}>
            {showCompare ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
            {showCompare ? 'Hide' : 'Compare all features'}
          </button>
        </div>

        {/* Full feature comparison table */}
        {showCompare && (
          <div className="bg-white rounded-2xl overflow-hidden mb-12" style={{ border: `1px solid ${LI_BORDER}` }}>
            {/* Table header */}
            <div className="grid grid-cols-4 text-center border-b" style={{ borderColor: LI_BORDER }}>
              <div className="p-4 text-left text-sm font-semibold" style={{ color: LI_TEXT }}>Feature</div>
              {[
                { id: 'free',       label: 'Free',       accent: '#868E96' },
                { id: 'pro',        label: 'Pro',        accent: LI_BLUE },
                { id: 'enterprise', label: 'Enterprise', accent: '#5B4FE8' },
              ].map(({ id, label, accent }) => (
                <div key={id} className="p-4">
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ backgroundColor: accent + '15', color: accent }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={i}
                className="grid grid-cols-4 text-center border-b last:border-0 items-center"
                style={{ borderColor: LI_BORDER, backgroundColor: i % 2 === 0 ? '#FAFAFA' : '#fff' }}>
                <div className="p-3.5 text-left text-xs font-medium" style={{ color: LI_TEXT }}>{row.feature}</div>
                <div className="p-3.5 flex items-center justify-center"><CompareCell value={row.free}       accent="#868E96" /></div>
                <div className="p-3.5 flex items-center justify-center"><CompareCell value={row.pro}        accent={LI_BLUE} /></div>
                <div className="p-3.5 flex items-center justify-center"><CompareCell value={row.enterprise} accent="#5B4FE8" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Enterprise CTA */}
        <div className="rounded-2xl p-8 mb-12 text-center"
          style={{ background: 'linear-gradient(135deg, #0A66C2, #5B4FE8)', color: '#fff' }}>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <FaUsers size={20} style={{ color: '#fff' }} />
          </div>
          <h3 className="text-xl font-bold mb-2">Need a custom plan?</h3>
          <p className="text-sm mb-5 opacity-80">
            Large teams and agencies get custom limits, SLA, SSO, and dedicated account management.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/contact"
              className="px-6 py-2.5 rounded-full bg-white text-sm font-bold"
              style={{ color: LI_BLUE }}>
              {t('pricing.contactSales')}
            </Link>
            <a href="mailto:enterprise@checkcolors.com"
              className="px-6 py-2.5 rounded-full border border-white/40 text-sm font-semibold text-white">
              <FaHeadset className="inline me-1.5" size={12} />
              enterprise@checkcolors.com
            </a>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-8" style={{ border: `1px solid ${LI_BORDER}` }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: LI_TEXT }}>{t('pricing.faqTitle')}</h2>
          {faqs.map((faq, i) => <FAQ key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </div>
  );
}
