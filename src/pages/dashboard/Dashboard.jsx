import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiGrid, FiStar, FiUsers, FiCopy, FiLogOut, FiSettings, FiZap, FiTrendingUp } from 'react-icons/fi';

const PLAN_BADGE = {
  free: { label: 'مجاني', color: 'bg-slate-600 text-slate-200' },
  pro: { label: 'Pro ⭐', color: 'bg-indigo-600 text-white' },
  enterprise: { label: 'Enterprise 🚀', color: 'bg-purple-600 text-white' },
};

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [palettes, setPalettes] = useState([]);
  const [referrals, setReferrals] = useState(null);
  const [tab, setTab] = useState('palettes');

  useEffect(() => {
    api.get('/palettes/my').then(r => setPalettes(r.data.palettes));
    api.get('/subscriptions/referrals').then(r => setReferrals(r.data));
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referrals?.referralLink || '');
    toast.success('تم نسخ رابط الإحالة!');
  };

  const plan = user?.subscription?.plan || 'free';
  const badge = PLAN_BADGE[plan];
  const aiLeft = plan === 'free' ? (5 - (user?.aiGenerations || 0)) : plan === 'pro' ? (100 - (user?.aiGenerations || 0)) : '∞';

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      {/* Topbar */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">C</div>
            <span className="font-bold">CheckColors</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition">
                لوحة الإدارة
              </Link>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.color}`}>{badge.label}</span>
            <button onClick={logout} className="text-slate-400 hover:text-white transition"><FiLogOut /></button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">مرحباً، {user?.name} 👋</h1>
          <p className="text-slate-400 mt-1">إدارة باليتاتك واشتراكاتك</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiGrid, label: 'باليتات محفوظة', value: palettes.length, sub: plan === 'free' ? `/ 10` : '∞' },
            { icon: FiZap, label: 'توليدات AI', value: user?.aiGenerations || 0, sub: plan === 'free' ? '/ 5 شهرياً' : plan === 'pro' ? '/ 100 شهرياً' : 'غير محدود' },
            { icon: FiUsers, label: 'إحالات', value: user?.referralCount || 0, sub: 'مستخدم' },
            { icon: FiStar, label: 'مكافأة الإحالة', value: user?.referralReward || 0, sub: 'يوم مجاني' },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <Icon className="text-indigo-400 mb-2" />
              <div className="text-2xl font-bold">{value} <span className="text-sm text-slate-400 font-normal">{sub}</span></div>
              <div className="text-slate-400 text-sm mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Upgrade banner for free */}
        {plan === 'free' && (
          <Link to="/pricing" className="block bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-4 mb-8 hover:border-indigo-400/50 transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-indigo-300 flex items-center gap-2"><FiTrendingUp /> ارتقِ إلى Pro</p>
                <p className="text-slate-400 text-sm mt-0.5">باليتات غير محدودة + 100 توليد AI شهرياً</p>
              </div>
              <span className="text-indigo-400 text-sm font-medium">$9.99/شهر ←</span>
            </div>
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-0">
          {[
            { id: 'palettes', label: 'باليتاتي' },
            { id: 'referrals', label: 'الإحالات' },
            { id: 'settings', label: 'الإعدادات' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Palettes Tab */}
        {tab === 'palettes' && (
          <div>
            {palettes.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FiGrid className="mx-auto text-4xl mb-3" />
                <p>لا توجد باليتات محفوظة بعد</p>
                <Link to="/Generate-Palette" className="text-indigo-400 text-sm hover:underline mt-2 inline-block">ابدأ بإنشاء باليت</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {palettes.map(p => (
                  <div key={p._id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition">
                    <div className="flex h-16">
                      {p.colors.map(c => <div key={c} style={{ backgroundColor: c }} className="flex-1" />)}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.colors.length} ألوان</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {tab === 'referrals' && referrals && (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-1">كود الإحالة الخاص بك</h3>
              <p className="text-slate-400 text-sm mb-4">شارك هذا الرابط واحصل على 7 أيام Pro مجاناً لكل صديق يسجل</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-slate-800 rounded-lg px-4 py-2.5 text-indigo-300 text-sm font-mono truncate">{referrals.referralLink}</code>
                <button onClick={copyReferralLink} className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition"><FiCopy /></button>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4">المستخدمون المُحالون ({referrals.referralCount})</h3>
              {referrals.referrals.length === 0 ? (
                <p className="text-slate-500 text-sm">لا يوجد إحالات بعد</p>
              ) : (
                <div className="space-y-2">
                  {referrals.referrals.map(r => (
                    <div key={r._id} className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_BADGE[r.subscription?.plan]?.color}`}>
                        {PLAN_BADGE[r.subscription?.plan]?.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-4 max-w-lg">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><FiSettings /> إعدادات الحساب</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between"><span>الاسم</span><span className="text-white">{user?.name}</span></div>
                <div className="flex justify-between"><span>البريد</span><span className="text-white">{user?.email}</span></div>
                <div className="flex justify-between"><span>الخطة</span><span className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>{badge.label}</span></div>
                <div className="flex justify-between"><span>تاريخ الانضمام</span><span className="text-white">{new Date(user?.createdAt).toLocaleDateString('ar')}</span></div>
              </div>
              {plan !== 'free' && (
                <button className="mt-4 text-red-400 text-sm hover:text-red-300 transition">إلغاء الاشتراك</button>
              )}
            </div>
            {plan === 'free' && (
              <Link to="/pricing" className="block bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 rounded-xl font-medium hover:opacity-90 transition">
                ترقية إلى Pro
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
