import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  FaTableCells, FaStar, FaUsers, FaCopy, FaRightFromBracket,
  FaGear, FaBolt, FaArrowTrendUp, FaShieldHalved, FaCrown,
  FaTrash, FaEye, FaPlus, FaChartBar
} from 'react-icons/fa6';

const PLAN_BADGE = {
  free:       { label: 'مجاني',      bg: 'bg-gray-100',    text: 'text-gray-600' },
  pro:        { label: 'Pro',         bg: 'bg-blue-100',    text: 'text-blue-700' },
  enterprise: { label: 'Enterprise', bg: 'bg-purple-100',  text: 'text-purple-700' },
};

export default function Dashboard() {
  const { user, logout, isAdmin, isPro } = useAuth();
  const [palettes, setPalettes] = useState([]);
  const [referrals, setReferrals] = useState(null);
  const [tab, setTab] = useState('palettes');
  const [loadingPalettes, setLoadingPalettes] = useState(true);

  useEffect(() => {
    api.get('/palettes/my').then(r => setPalettes(r.data.palettes)).finally(() => setLoadingPalettes(false));
    api.get('/subscriptions/referrals').then(r => setReferrals(r.data)).catch(() => {});
  }, []);

  const deletePalette = async (id) => {
    if (!confirm('حذف الباليت؟')) return;
    await api.delete(`/palettes/${id}`);
    setPalettes(p => p.filter(x => x._id !== id));
    toast.success('تم الحذف');
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referrals?.referralLink || '');
    toast.success('تم نسخ رابط الإحالة!');
  };

  const plan = user?.subscription?.plan || 'free';
  const badge = PLAN_BADGE[plan];

  const stats = [
    { icon: FaTableCells, label: 'باليتات محفوظة', value: palettes.length, sub: plan === 'free' ? '/ 10' : '∞', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: FaBolt,       label: 'توليدات AI',     value: user?.aiGenerations || 0, sub: plan === 'free' ? '/ 5 شهرياً' : '∞', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: FaUsers,      label: 'إحالات',         value: user?.referralCount || 0, sub: 'مستخدم', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: FaStar,       label: 'مكافأة إحالة',   value: user?.referralReward || 0, sub: 'يوم Pro', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">C</div>
            <span className="font-black text-gray-800 text-lg">CheckColors</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium">
                <FaShieldHalved /> إدارة الموقع
              </Link>
            )}
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition p-1" title="تسجيل الخروج">
              <FaRightFromBracket />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-800">مرحباً، {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1 text-sm">إدارة باليتاتك واشتراكاتك ومكافآتك</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value, sub, color, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`${color} text-lg`} />
              </div>
              <div className="text-2xl font-black text-gray-800">{value} <span className="text-sm text-gray-400 font-normal">{sub}</span></div>
              <div className="text-gray-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Upgrade banner */}
        {plan === 'free' && (
          <Link to="/pricing" className="flex items-center justify-between bg-gradient-to-l from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-5 mb-6 hover:border-blue-400 transition group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <FaCrown className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800">ارتقِ إلى Pro</p>
                <p className="text-gray-500 text-sm">باليتات ∞ + 100 AI شهرياً + تصدير متقدم</p>
              </div>
            </div>
            <span className="text-blue-600 font-bold text-sm group-hover:gap-2 transition flex items-center gap-1">
              $9.99/شهر <FaArrowTrendUp />
            </span>
          </Link>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {[
            { id: 'palettes', label: 'باليتاتي', icon: FaTableCells },
            { id: 'referrals', label: 'الإحالات', icon: FaUsers },
            { id: 'settings', label: 'الإعدادات', icon: FaGear },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="text-xs" /> {label}
            </button>
          ))}
        </div>

        {/* Palettes */}
        {tab === 'palettes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">الباليتات المحفوظة ({palettes.length})</h3>
              <Link to="/Generate-Palette" className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-medium">
                <FaPlus className="text-xs" /> باليت جديد
              </Link>
            </div>
            {loadingPalettes ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : palettes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <FaTableCells className="mx-auto text-4xl text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">لا توجد باليتات بعد</p>
                <Link to="/Generate-Palette" className="text-blue-600 text-sm hover:underline mt-2 inline-block">ابدأ بإنشاء باليت</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {palettes.map(p => (
                  <div key={p._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition group">
                    <div className="flex h-20">
                      {p.colors.map(c => <div key={c} style={{ backgroundColor: c }} className="flex-1" />)}
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.colors.length} ألوان</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition"><FaEye className="text-xs" /></button>
                        <button onClick={() => deletePalette(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><FaTrash className="text-xs" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referrals */}
        {tab === 'referrals' && referrals && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <FaUsers className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">رابط الإحالة الخاص بك</h3>
                  <p className="text-gray-500 text-sm mt-0.5">احصل على 7 أيام Pro مجاناً لكل صديق يسجل برابطك</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-mono truncate">{referrals.referralLink}</div>
                <button onClick={copyReferralLink} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                  <FaCopy /> نسخ
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: 'إجمالي الإحالات', value: referrals.referralCount },
                  { label: 'أيام مكافأة', value: referrals.referralReward },
                  { label: 'كود الإحالة', value: user?.referralCode },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-gray-800">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {referrals.referrals?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">المستخدمون المُحالون ({referrals.referrals.length})</h3>
                <div className="space-y-2">
                  {referrals.referrals.map(r => (
                    <div key={r._id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {r.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PLAN_BADGE[r.subscription?.plan || 'free'].bg} ${PLAN_BADGE[r.subscription?.plan || 'free'].text}`}>
                        {PLAN_BADGE[r.subscription?.plan || 'free'].label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div className="max-w-lg space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2"><FaGear className="text-gray-400" /> معلومات الحساب</h3>
              <div className="space-y-3">
                {[
                  { label: 'الاسم', value: user?.name },
                  { label: 'البريد الإلكتروني', value: user?.email },
                  { label: 'تاريخ الانضمام', value: new Date(user?.createdAt).toLocaleDateString('ar-EG') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">الخطة</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                </div>
              </div>
            </div>

            {plan === 'free' ? (
              <Link to="/pricing" className="block bg-blue-600 text-white text-center py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition">
                ترقية إلى Pro — $9.99/شهر
              </Link>
            ) : (
              <button className="w-full text-red-500 text-sm hover:text-red-600 transition py-2">إلغاء الاشتراك</button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
