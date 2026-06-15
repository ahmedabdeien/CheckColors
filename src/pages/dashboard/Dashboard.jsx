import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import chroma from 'chroma-js';
import {
  FaTableCells, FaUsers, FaCopy, FaRightFromBracket,
  FaGear, FaBolt, FaShieldHalved, FaCrown, FaTrash, FaEye,
  FaPlus, FaPalette, FaHouse, FaCircleHalfStroke, FaFill, FaDroplet,
  FaWandMagicSparkles, FaImage, FaShuffle, FaBookmark, FaMagnifyingGlass,
  FaCheck, FaPen, FaXmark, FaArrowRight, FaRocket, FaHeart,
} from 'react-icons/fa6';
import { Link as RouterLink } from 'react-router-dom';

const STARTER_PALETTES = [
  { name: 'Ocean Blue',   colors: ['#03045E','#0077B6','#00B4D8','#90E0EF','#CAF0F8'] },
  { name: 'Warm Sunset',  colors: ['#03071E','#6A040F','#D00000','#E85D04','#FAA307'] },
  { name: 'Forest Green', colors: ['#1B4332','#2D6A4F','#40916C','#74C69D','#D8F3DC'] },
  { name: 'Lavender',     colors: ['#10002B','#3C096C','#7B2FBE','#C77DFF','#E0AAFF'] },
  { name: 'Minimal Gray', colors: ['#212529','#495057','#868E96','#DEE2E6','#F8F9FA'] },
  { name: 'Golden Hour',  colors: ['#7B2D00','#D4521A','#F59E0B','#FCD34D','#FFFBEB'] },
];

function EmptyPalettes({ t }) {
  return (
    <div>
      <div className="rounded-2xl p-6 mb-5 text-center"
        style={{ background: 'linear-gradient(135deg, #EEF3F8 0%, #F5F0FF 100%)', border: '1px solid #E0DFDC' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, #0A66C2, #7C3AED)' }}>
          <FaRocket className="text-white text-xl" />
        </div>
        <h3 className="font-bold text-base mb-1" style={{ color: '#000000E6' }}>{t('dashboard.noPalettes')}</h3>
        <p className="text-sm mb-4" style={{ color: '#00000099' }}>
          {t('dashboard.emptyDesc', 'Generate a palette with AI or pick a starter template below')}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <RouterLink to="/Ai-Colors"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #0A66C2, #7C3AED)' }}>
            <FaWandMagicSparkles size={12} /> {t('services.aiColors')}
          </RouterLink>
          <RouterLink to="/Generate-Palette"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: '#0A66C2', color: '#0A66C2', backgroundColor: '#fff' }}>
            <FaShuffle size={12} /> {t('dashboard.createFirst')}
          </RouterLink>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#00000099' }}>
          {t('dashboard.starterTemplates', 'Starter Templates')}
        </p>
        <RouterLink to="/explore" className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#0A66C2' }}>
          {t('dashboard.exploreMore', 'Explore more')} <FaArrowRight size={9} />
        </RouterLink>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STARTER_PALETTES.map(p => (
          <RouterLink key={p.name} to="/Generate-Palette"
            className="rounded-xl overflow-hidden group transition-all hover:shadow-md"
            style={{ border: '1px solid #E0DFDC' }}>
            <div className="flex" style={{ height: 52 }}>
              {p.colors.map(c => <div key={c} style={{ flex: 1, backgroundColor: c }} />)}
            </div>
            <div className="bg-white px-3 py-2 flex items-center justify-between">
              <p className="text-xs font-semibold" style={{ color: '#000000E6' }}>{p.name}</p>
              <span className="text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: '#0A66C2' }}>
                {t('dashboard.useTemplate', 'Use')} <FaArrowRight size={8} />
              </span>
            </div>
          </RouterLink>
        ))}
      </div>
    </div>
  );
}
import CheckColorsLogo from '../../assets/cc-logo.svg';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const PLAN_STYLE = {
  free:       { label: 'Free',       bg: '#F3F2EF',  color: '#00000099'  },
  pro:        { label: 'Pro',        bg: '#EEF3F8',  color: LI_BLUE      },
  enterprise: { label: 'Enterprise', bg: '#F5F0FF',  color: '#5B4FE8'    },
};

const getContrast = hex => {
  try { return chroma(hex).luminance() > 0.35 ? '#000' : '#fff'; } catch { return '#000'; }
};

export default function Dashboard() {
  const { user, logout, isAdmin, isPro } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [searchParams, setSearchParams] = useSearchParams();
  const [palettes, setPalettes] = useState([]);
  const [savedColors, setSavedColors] = useState([]);
  const [referrals, setReferrals] = useState(null);
  const [tab, setTab] = useState(searchParams.get('tab') || 'palettes');
  const [loadingPalettes, setLoadingPalettes] = useState(true);
  const [loadingColors, setLoadingColors] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Saved color picker state
  const [pickerHex, setPickerHex] = useState('#0A66C2');
  const [pickerName, setPickerName] = useState('');
  const [pickerNote, setPickerNote] = useState('');
  const [colorSearch, setColorSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Handle Stripe redirect back
  useEffect(() => {
    const subParam = searchParams.get('subscription');
    if (subParam === 'success') {
      toast.success(t('dashboard.subSuccess', 'Subscription activated! Welcome aboard 🎉'));
      setSearchParams({});
    } else if (subParam === 'cancelled') {
      toast(t('dashboard.subCancelled', 'Payment cancelled — no charges made.'));
      setSearchParams({});
    }
  }, []);

  useEffect(() => {
    api.get('/palettes/my').then(r => setPalettes(r.data.palettes)).finally(() => setLoadingPalettes(false));
    api.get('/subscriptions/referrals').then(r => setReferrals(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'colors') {
      setLoadingColors(true);
      api.get('/colors/saved').then(r => setSavedColors(r.data.colors)).finally(() => setLoadingColors(false));
    }
  }, [tab]);

  const deletePalette = async (id) => {
    if (!confirm(t('dashboard.confirmDelete', 'Delete this palette?'))) return;
    await api.delete(`/palettes/${id}`);
    setPalettes(p => p.filter(x => x._id !== id));
    toast.success(t('dashboard.paletteDeleted', 'Palette deleted'));
  };

  const likePalette = async (id) => {
    try {
      const { data } = await api.post(`/palettes/${id}/like`);
      setPalettes(ps => ps.map(p => p._id === id ? { ...p, likes: data.likes, likedByMe: data.likedByMe } : p));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data } = await api.post('/subscriptions/portal');
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally { setPortalLoading(false); }
  };

  const cancelSub = async () => {
    if (!confirm(t('dashboard.confirmCancel', 'Cancel subscription at period end?'))) return;
    setCancelLoading(true);
    try {
      const { data } = await api.post('/subscriptions/cancel');
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally { setCancelLoading(false); }
  };

  const reactivateSub = async () => {
    try {
      const { data } = await api.post('/subscriptions/reactivate');
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const saveColor = async () => {
    if (!pickerHex) return;
    try {
      const { data } = await api.post('/colors/saved', { hex: pickerHex, name: pickerName, note: pickerNote });
      setSavedColors(prev => [data.color, ...prev]);
      setPickerName(''); setPickerNote('');
      toast.success(t('dashboard.colorSaved', 'Color saved!'));
    } catch { toast.error(t('common.error')); }
  };

  const deleteColor = async (id) => {
    await api.delete(`/colors/saved/${id}`);
    setSavedColors(prev => prev.filter(c => c._id !== id));
    toast.success(t('dashboard.colorRemoved', 'Color removed'));
  };

  const renameColor = async (id) => {
    await api.patch(`/colors/saved/${id}`, { name: editName });
    setSavedColors(prev => prev.map(c => c._id === id ? { ...c, name: editName } : c));
    setEditingId(null);
    toast.success(t('common.save'));
  };

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex.toUpperCase());
    toast.success(`Copied ${hex.toUpperCase()}`);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referrals?.referralLink || '');
    toast.success(t('dashboard.copy'));
  };

  const plan = user?.subscription?.plan || 'free';
  const planStyle = PLAN_STYLE[plan];

  const tabs = [
    { id: 'palettes', label: t('dashboard.myPalettes'), icon: FaTableCells },
    { id: 'colors',   label: t('dashboard.savedColors', 'Saved Colors'),  icon: FaBookmark },
    { id: 'referrals',label: t('dashboard.referrals'),  icon: FaUsers },
    { id: 'settings', label: t('dashboard.settings'),   icon: FaGear },
  ];

  const quickTools = [
    { icon: FaWandMagicSparkles, label: t('services.aiColors'),        to: '/Ai-Colors',          color: LI_BLUE },
    { icon: FaCircleHalfStroke,  label: t('services.contrastChecker'), to: '/Contrast-Checker',   color: '#057642' },
    { icon: FaFill,              label: t('services.gradientGenerator'),to: '/gradient-generator', color: '#7C3AED' },
    { icon: FaDroplet,           label: t('services.tintsShades'),      to: '/tints-shades',       color: '#0891B2' },
    { icon: FaImage,             label: t('services.imageToPalette'),   to: '/image-to-palette',   color: '#D97706' },
    { icon: FaShuffle,           label: t('services.generatePalette'),  to: '/Generate-Palette',   color: '#DC2626' },
  ];

  const filteredColors = savedColors.filter(c =>
    !colorSearch || c.hex.toLowerCase().includes(colorSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(colorSearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top navbar */}
      <div className="bg-white sticky top-0 z-20 border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={CheckColorsLogo} alt="CheckColors" className="w-8 h-8" />
            <span className="font-bold text-sm hidden sm:block" style={{ color: LI_BLUE }}>CheckColors</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #5BA4CF)` }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold leading-tight" style={{ color: LI_TEXT }}>{user?.name?.split(' ')[0]}</p>
              <span className="text-[10px] font-medium" style={{ color: planStyle.color }}>{planStyle.label}</span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Link to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
              style={{ borderColor: LI_BORDER, color: LI_MUTED }}
              onMouseEnter={e => e.currentTarget.style.borderColor = LI_BLUE}
              onMouseLeave={e => e.currentTarget.style.borderColor = LI_BORDER}>
              <FaHouse className="text-[10px]" /> {t('nav.home')}
            </Link>
            {isAdmin && (
              <Link to="/admin"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold"
                style={{ borderColor: '#CC1016', color: '#CC1016' }}>
                <FaShieldHalved /> {t('nav.adminPanel')}
              </Link>
            )}
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors"
              style={{ borderColor: LI_BORDER, color: LI_MUTED }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CC1016'; e.currentTarget.style.color = '#CC1016'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = LI_BORDER; e.currentTarget.style.color = LI_MUTED; }}>
              <FaRightFromBracket /> {t('nav.signOut')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-5">
        {/* Left sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="p-4 border-b" style={{ borderColor: LI_BORDER }}>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold mb-2"
                style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #5BA4CF)` }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-center" style={{ color: LI_TEXT }}>{user?.name}</p>
              <p className="text-xs text-center mt-0.5 truncate" style={{ color: LI_MUTED }}>{user?.email}</p>
            </div>
            <nav className="p-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-left transition-colors"
                  style={{
                    backgroundColor: tab === id ? '#EEF3F8' : 'transparent',
                    color: tab === id ? LI_BLUE : LI_MUTED,
                  }}>
                  <Icon className="text-base" /> {label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t" style={{ borderColor: LI_BORDER }}>
              {plan === 'free' && (
                <Link to="/pricing"
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-semibold"
                  style={{ color: '#915907', backgroundColor: '#FFF9F0' }}>
                  <FaCrown /> {t('dashboard.upgradeTitle')}
                </Link>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl mt-3 p-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: LI_MUTED }}>{t('dashboard.quickStats')}</p>
            {[
              { icon: FaTableCells, label: t('dashboard.palettes'), value: palettes.length, max: plan === 'free' ? '/10' : '/∞' },
              { icon: FaBookmark,   label: t('dashboard.savedColors', 'Saved Colors'), value: savedColors.length || '—', max: '' },
              { icon: FaBolt,       label: t('dashboard.aiGenerations'), value: user?.aiGenerations || 0, max: '' },
              { icon: FaUsers,      label: t('dashboard.referralsCount'), value: user?.referralCount || 0, max: '' },
            ].map(({ icon: Icon, label, value, max }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                style={{ borderColor: LI_BORDER }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: LI_MUTED }}>
                  <Icon className="text-sm" style={{ color: LI_BLUE }} /> {label}
                </div>
                <span className="text-xs font-semibold" style={{ color: LI_TEXT }}>{value}{max}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-1 bg-white rounded-xl p-1 mb-4 overflow-x-auto" style={{ border: `1px solid ${LI_BORDER}` }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex-shrink-0 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: tab === id ? LI_BLUE : 'transparent', color: tab === id ? '#fff' : LI_MUTED }}>
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* Quick Tools (palettes + colors tabs) */}
          {(tab === 'palettes' || tab === 'colors') && (
            <div className="bg-white rounded-xl p-4 mb-4" style={{ border: `1px solid ${LI_BORDER}` }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: LI_MUTED }}>{t('dashboard.quickAccess', 'Quick Access')}</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {quickTools.map(({ icon: Icon, label, to, color }) => (
                  <Link key={to} to={to}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-colors hover:opacity-80"
                    style={{ backgroundColor: '#F3F2EF' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '18' }}>
                      <Icon className="text-sm" style={{ color }} />
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight" style={{ color: LI_MUTED }}>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Usage bar (free) */}
          {tab === 'palettes' && plan === 'free' && (
            <div className="bg-white rounded-xl p-4 mb-4" style={{ border: `1px solid ${LI_BORDER}` }}>
              <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: LI_MUTED }}>{t('dashboard.usage', 'Usage')}</p>
              <div className="space-y-3">
                {[
                  { label: t('dashboard.palettes'), value: palettes.length, max: 10, color: LI_BLUE },
                  { label: t('dashboard.aiGenerations'), value: user?.aiGenerations || 0, max: 5, color: '#7C3AED' },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: LI_MUTED }}>{label}</span>
                      <span style={{ color: LI_TEXT }} className="font-semibold">{value} / {max}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: '#E0DFDC' }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: value >= max ? '#CC1016' : color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro upgrade banner */}
          {plan === 'free' && (
            <Link to="/pricing"
              className="flex items-center justify-between bg-white rounded-xl p-4 mb-4 transition-shadow hover:shadow-sm"
              style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF9F0' }}>
                  <FaCrown style={{ color: '#915907' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: LI_TEXT }}>{t('dashboard.upgradeTitle')}</p>
                  <p className="text-xs" style={{ color: LI_MUTED }}>{t('dashboard.upgradeDesc')}</p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ color: LI_BLUE }}>$9.99/mo →</span>
            </Link>
          )}

          {/* ── PALETTES TAB ── */}
          {tab === 'palettes' && (
            <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: LI_BORDER }}>
                <h2 className="font-semibold text-base" style={{ color: LI_TEXT }}>{t('dashboard.myPalettes')} ({palettes.length})</h2>
                {plan === 'free' && palettes.length >= 10 ? (
                  <Link to="/pricing"
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-semibold"
                    style={{ backgroundColor: '#FFF3F3', color: '#CC1016', border: '1px solid #FECACA' }}>
                    <FaCrown size={11} /> {t('common.upgradeRequired')}
                  </Link>
                ) : (
                  <Link to="/Generate-Palette"
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full text-white font-semibold"
                    style={{ backgroundColor: LI_BLUE }}>
                    <FaPlus /> {t('dashboard.newPalette')}
                  </Link>
                )}
              </div>
              <div className="p-5">
                {loadingPalettes ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="rounded-xl animate-pulse h-28" style={{ backgroundColor: '#F3F2EF' }} />
                    ))}
                  </div>
                ) : palettes.length === 0 ? (
                  <EmptyPalettes t={t} />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {palettes.map(p => (
                      <div key={p._id} className="rounded-xl overflow-hidden group transition-shadow hover:shadow-md"
                        style={{ border: `1px solid ${LI_BORDER}` }}>
                        <div className="flex h-16">
                          {p.colors.map(c => <div key={c} style={{ backgroundColor: c }} className="flex-1" />)}
                        </div>
                        <div className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold truncate" style={{ color: LI_TEXT }}>{p.name}</p>
                            <p className="text-[10px]" style={{ color: LI_MUTED }}>{p.colors.length} {t('dashboard.colorsCount', 'colors')}</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => likePalette(p._id)} className="p-1.5 rounded flex items-center gap-0.5"
                              style={{ color: p.likedByMe ? '#CC1016' : LI_MUTED }} title={t('common.like', 'Like')}>
                              <FaHeart className="text-xs" />
                              {p.likes > 0 && <span className="text-[9px]">{p.likes}</span>}
                            </button>
                            <button className="p-1.5 rounded" style={{ color: LI_BLUE }} title={t('common.view')}><FaEye className="text-xs" /></button>
                            <button onClick={() => deletePalette(p._id)} className="p-1.5 rounded"
                              style={{ color: '#CC1016' }} title={t('common.delete')}><FaTrash className="text-xs" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SAVED COLORS TAB ── */}
          {tab === 'colors' && (
            <div className="space-y-4">
              {/* Color picker to save */}
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaBookmark style={{ color: LI_BLUE }} /> {t('dashboard.saveAColor', 'Save a Color')}
                </h3>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: LI_MUTED }}>{t('dashboard.colorHex', 'Color')}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={pickerHex} onChange={e => setPickerHex(e.target.value)}
                        className="w-12 h-10 rounded-lg cursor-pointer border-0 p-0.5"
                        style={{ border: `1px solid ${LI_BORDER}` }} />
                      <input type="text" value={pickerHex} onChange={e => setPickerHex(e.target.value)}
                        className="w-28 text-sm px-3 py-2 rounded-lg font-mono outline-none"
                        style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                        onFocus={e => e.target.style.borderColor = LI_BLUE}
                        onBlur={e => e.target.style.borderColor = LI_BORDER} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-32">
                    <label className="block text-xs mb-1" style={{ color: LI_MUTED }}>{t('dashboard.colorName', 'Name (optional)')}</label>
                    <input type="text" value={pickerName} onChange={e => setPickerName(e.target.value)}
                      placeholder={t('dashboard.colorNamePlaceholder', 'e.g. Brand Blue')}
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                      style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                      onFocus={e => e.target.style.borderColor = LI_BLUE}
                      onBlur={e => e.target.style.borderColor = LI_BORDER} />
                  </div>
                  <div className="flex-1 min-w-32">
                    <label className="block text-xs mb-1" style={{ color: LI_MUTED }}>{t('dashboard.colorNote', 'Note')}</label>
                    <input type="text" value={pickerNote} onChange={e => setPickerNote(e.target.value)}
                      placeholder={t('dashboard.colorNotePlaceholder', 'Usage, project...')}
                      className="w-full text-sm px-3 py-2 rounded-lg outline-none"
                      style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                      onFocus={e => e.target.style.borderColor = LI_BLUE}
                      onBlur={e => e.target.style.borderColor = LI_BORDER} />
                  </div>
                  <button onClick={saveColor}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ backgroundColor: LI_BLUE }}>
                    <FaPlus size={12} /> {t('common.save')}
                  </button>
                </div>
                {/* Preview swatch */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: pickerHex, color: getContrast(pickerHex) }}>
                    {pickerHex.toUpperCase()}
                  </div>
                  <div className="text-xs" style={{ color: LI_MUTED }}>
                    {(() => { try { const [r, g, b] = chroma(pickerHex).rgb(); return `rgb(${r}, ${g}, ${b})`; } catch { return ''; } })()}
                    {' · '}
                    {(() => { try { const [h, s, l] = chroma(pickerHex).hsl(); return `hsl(${Math.round(h||0)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)`; } catch { return ''; } })()}
                  </div>
                </div>
              </div>

              {/* Saved colors grid */}
              <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: LI_BORDER }}>
                  <h3 className="font-semibold text-sm" style={{ color: LI_TEXT }}>
                    {t('dashboard.mySavedColors', 'My Saved Colors')} ({savedColors.length})
                  </h3>
                  <div className="relative">
                    <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: LI_MUTED }} />
                    <input value={colorSearch} onChange={e => setColorSearch(e.target.value)}
                      placeholder={t('common.search')}
                      className="pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none w-36"
                      style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                      onFocus={e => e.target.style.borderColor = LI_BLUE}
                      onBlur={e => e.target.style.borderColor = LI_BORDER} />
                  </div>
                </div>
                <div className="p-5">
                  {loadingColors ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="rounded-xl animate-pulse h-24" style={{ backgroundColor: '#F3F2EF' }} />
                      ))}
                    </div>
                  ) : filteredColors.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBookmark className="mx-auto text-3xl mb-3" style={{ color: '#B0B0B0' }} />
                      <p className="text-sm" style={{ color: LI_MUTED }}>
                        {savedColors.length === 0 ? t('dashboard.noSavedColors', 'No saved colors yet. Pick a color above and save it!') : t('common.noResults')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredColors.map(c => (
                        <div key={c._id} className="group rounded-xl overflow-hidden transition-shadow hover:shadow-md"
                          style={{ border: `1px solid ${LI_BORDER}` }}>
                          {/* Swatch */}
                          <div className="relative h-20 flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: c.hex }}
                            onClick={() => copyHex(c.hex)}>
                            <span className="text-xs font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: getContrast(c.hex) }}>
                              {c.hex.toUpperCase()}
                            </span>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={e => { e.stopPropagation(); copyHex(c.hex); }}
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <FaCopy size={9} style={{ color: getContrast(c.hex) }} />
                              </button>
                              <button onClick={e => { e.stopPropagation(); deleteColor(c._id); }}
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <FaTrash size={9} style={{ color: getContrast(c.hex) }} />
                              </button>
                            </div>
                          </div>
                          {/* Info */}
                          <div className="px-3 py-2">
                            {editingId === c._id ? (
                              <div className="flex items-center gap-1">
                                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') renameColor(c._id); if (e.key === 'Escape') setEditingId(null); }}
                                  className="flex-1 text-xs px-1.5 py-1 rounded outline-none"
                                  style={{ border: `1px solid ${LI_BLUE}`, color: LI_TEXT }} />
                                <button onClick={() => renameColor(c._id)} style={{ color: '#057642' }}><FaCheck size={10} /></button>
                                <button onClick={() => setEditingId(null)} style={{ color: '#CC1016' }}><FaXmark size={10} /></button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold truncate" style={{ color: LI_TEXT }}>
                                  {c.name || c.hex.toUpperCase()}
                                </p>
                                <button onClick={() => { setEditingId(c._id); setEditName(c.name || c.hex); }}
                                  className="opacity-0 group-hover:opacity-100"
                                  style={{ color: LI_MUTED }}>
                                  <FaPen size={9} />
                                </button>
                              </div>
                            )}
                            {c.note && <p className="text-[10px] truncate mt-0.5" style={{ color: LI_MUTED }}>{c.note}</p>}
                            <p className="text-[10px] font-mono mt-0.5" style={{ color: LI_MUTED }}>{c.hex.toUpperCase()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── REFERRALS TAB ── */}
          {tab === 'referrals' && referrals && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF3F8' }}>
                    <FaUsers style={{ color: LI_BLUE }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: LI_TEXT }}>{t('dashboard.yourReferralLink')}</h3>
                    <p className="text-xs" style={{ color: LI_MUTED }}>{t('dashboard.referralDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-xs font-mono px-3 py-2.5 rounded-md truncate"
                    style={{ backgroundColor: '#F3F2EF', color: LI_MUTED, border: `1px solid ${LI_BORDER}` }}>
                    {referrals.referralLink}
                  </div>
                  <button onClick={copyReferralLink}
                    className="flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-full font-semibold text-white"
                    style={{ backgroundColor: LI_BLUE }}>
                    <FaCopy /> {t('dashboard.copy')}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: t('dashboard.totalReferrals'), value: referrals.referralCount },
                    { label: t('dashboard.rewardDays'), value: referrals.referralReward },
                    { label: t('dashboard.yourCode'), value: user?.referralCode },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg p-3 text-center" style={{ backgroundColor: '#F3F2EF' }}>
                      <p className="text-lg font-bold" style={{ color: LI_TEXT }}>{value}</p>
                      <p className="text-xs mt-0.5" style={{ color: LI_MUTED }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {referrals.referrals?.length > 0 && (
                <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: LI_BORDER }}>
                    <h3 className="font-semibold text-sm" style={{ color: LI_TEXT }}>
                      {t('dashboard.referredUsers', 'Referred Users')} ({referrals.referrals.length})
                    </h3>
                  </div>
                  <div className="divide-y" style={{ borderColor: LI_BORDER }}>
                    {referrals.referrals.map(r => (
                      <div key={r._id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: LI_BLUE }}>
                            {r.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: LI_TEXT }}>{r.name}</p>
                            <p className="text-xs" style={{ color: LI_MUTED }}>{r.email}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-sm font-medium"
                          style={PLAN_STYLE[r.subscription?.plan || 'free']}>
                          {PLAN_STYLE[r.subscription?.plan || 'free'].label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === 'settings' && (
            <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: LI_BORDER }}>
                <FaGear style={{ color: LI_BLUE }} />
                <h2 className="font-semibold text-base" style={{ color: LI_TEXT }}>{t('dashboard.settings')}</h2>
              </div>
              <div className="p-5 max-w-sm space-y-0 divide-y" style={{ borderColor: LI_BORDER }}>
                {[
                  { label: t('dashboard.fullName'), value: user?.name },
                  { label: t('dashboard.email'),    value: user?.email },
                  { label: t('dashboard.memberSince'), value: new Date(user?.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long' }) },
                  { label: t('dashboard.plan'),     value: planStyle.label },
                  ...(plan !== 'free' && user?.subscription?.currentPeriodEnd ? [{
                    label: t('dashboard.renewsOn', 'Renews on'),
                    value: new Date(user.subscription.currentPeriodEnd).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                  }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <span className="text-sm" style={{ color: LI_MUTED }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: LI_TEXT }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Subscription cancelled warning */}
              {plan !== 'free' && user?.subscription?.cancelAtPeriodEnd && (
                <div className="mx-5 mb-4 p-3 rounded-xl flex items-center justify-between gap-3"
                  style={{ backgroundColor: '#FFF3F3', border: '1px solid #FECACA' }}>
                  <p className="text-xs" style={{ color: '#CC1016' }}>
                    {t('dashboard.cancelWarning', 'Your subscription will end on')} {new Date(user?.subscription?.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  <button onClick={reactivateSub}
                    className="text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#057642', color: '#fff' }}>
                    {t('dashboard.reactivate', 'Keep plan')}
                  </button>
                </div>
              )}

              <div className="px-5 pb-5 space-y-2">
                {plan === 'free' ? (
                  <Link to="/pricing"
                    className="block w-full text-center py-2.5 rounded-full font-semibold text-sm"
                    style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
                    {t('dashboard.upgradeNow')}
                  </Link>
                ) : (
                  <>
                    <button onClick={openPortal} disabled={portalLoading}
                      className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-full font-semibold disabled:opacity-60"
                      style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
                      {portalLoading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : null}
                      {t('dashboard.manageSubscription', 'Manage Subscription')}
                    </button>
                    {!user?.subscription?.cancelAtPeriodEnd && (
                      <button onClick={cancelSub} disabled={cancelLoading}
                        className="w-full text-sm py-2 rounded-full border font-medium disabled:opacity-60"
                        style={{ borderColor: '#CC1016', color: '#CC1016' }}>
                        {cancelLoading
                          ? <span className="inline-block w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin mr-1" />
                          : null}
                        {t('dashboard.cancelSub')}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
