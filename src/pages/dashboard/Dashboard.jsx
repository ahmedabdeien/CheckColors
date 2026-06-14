import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  FaTableCells, FaStar, FaUsers, FaCopy, FaRightFromBracket,
  FaGear, FaBolt, FaShieldHalved, FaCrown, FaTrash, FaEye,
  FaPlus, FaChartBar, FaPalette
} from 'react-icons/fa6';

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
    if (!confirm('Delete this palette?')) return;
    await api.delete(`/palettes/${id}`);
    setPalettes(p => p.filter(x => x._id !== id));
    toast.success('Palette deleted');
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referrals?.referralLink || '');
    toast.success('Referral link copied!');
  };

  const plan = user?.subscription?.plan || 'free';
  const planStyle = PLAN_STYLE[plan];

  const tabs = [
    { id: 'palettes',  label: 'My Palettes',  icon: FaTableCells },
    { id: 'referrals', label: 'Referrals',    icon: FaUsers       },
    { id: 'settings',  label: 'Settings',     icon: FaGear        },
  ];

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="bg-white sticky top-14 z-10 border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base"
              style={{ background: `linear-gradient(135deg, ${LI_BLUE}, #5BA4CF)` }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: LI_TEXT }}>{user?.name}</p>
              <span className="text-xs px-2 py-0.5 rounded-sm font-medium"
                style={{ backgroundColor: planStyle.bg, color: planStyle.color }}>
                {planStyle.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin"
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold"
                style={{ borderColor: '#CC1016', color: '#CC1016' }}>
                <FaShieldHalved /> Admin
              </Link>
            )}
            <button onClick={logout} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold"
              style={{ borderColor: LI_BORDER, color: LI_MUTED }}>
              <FaRightFromBracket /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-5">
        {/* Left sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
            {/* Profile mini card */}
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
                  <FaCrown /> Upgrade to Pro
                </Link>
              )}
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-white rounded-xl mt-3 p-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            <p className="text-xs font-semibold mb-3" style={{ color: LI_MUTED }}>QUICK STATS</p>
            {[
              { icon: FaTableCells, label: 'Palettes', value: palettes.length, max: plan === 'free' ? '/10' : '/∞' },
              { icon: FaBolt, label: 'AI Generations', value: user?.aiGenerations || 0, max: '' },
              { icon: FaUsers, label: 'Referrals', value: user?.referralCount || 0, max: '' },
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
          <div className="lg:hidden flex gap-1 bg-white rounded-xl p-1 mb-4" style={{ border: `1px solid ${LI_BORDER}` }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                style={{ backgroundColor: tab === id ? LI_BLUE : 'transparent', color: tab === id ? '#fff' : LI_MUTED }}>
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* Pro upgrade banner */}
          {plan === 'free' && (
            <Link to="/pricing"
              className="flex items-center justify-between bg-white rounded-xl p-4 mb-4 transition-shadow hover:shadow-sm"
              style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FFF9F0' }}>
                  <FaCrown style={{ color: '#915907' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: LI_TEXT }}>Upgrade to Pro</p>
                  <p className="text-xs" style={{ color: LI_MUTED }}>Unlimited palettes · 100 AI/month · Advanced export</p>
                </div>
              </div>
              <span className="text-sm font-semibold" style={{ color: LI_BLUE }}>$9.99/mo →</span>
            </Link>
          )}

          {/* PALETTES TAB */}
          {tab === 'palettes' && (
            <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: LI_BORDER }}>
                <h2 className="font-semibold text-base" style={{ color: LI_TEXT }}>My Palettes ({palettes.length})</h2>
                <Link to="/Generate-Palette"
                  className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-full text-white font-semibold"
                  style={{ backgroundColor: LI_BLUE }}>
                  <FaPlus /> New Palette
                </Link>
              </div>
              <div className="p-5">
                {loadingPalettes ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="rounded-xl animate-pulse h-28" style={{ backgroundColor: '#F3F2EF' }} />
                    ))}
                  </div>
                ) : palettes.length === 0 ? (
                  <div className="text-center py-16">
                    <FaPalette className="mx-auto text-4xl mb-3" style={{ color: '#B0B0B0' }} />
                    <p className="text-sm font-medium" style={{ color: LI_MUTED }}>No palettes yet</p>
                    <Link to="/Generate-Palette" className="text-xs mt-2 inline-block font-semibold" style={{ color: LI_BLUE }}>
                      Create your first palette
                    </Link>
                  </div>
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
                            <p className="text-[10px]" style={{ color: LI_MUTED }}>{p.colors.length} colors</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded" style={{ color: LI_BLUE }}><FaEye className="text-xs" /></button>
                            <button onClick={() => deletePalette(p._id)} className="p-1.5 rounded"
                              style={{ color: '#CC1016' }}><FaTrash className="text-xs" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REFERRALS TAB */}
          {tab === 'referrals' && referrals && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF3F8' }}>
                    <FaUsers style={{ color: LI_BLUE }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: LI_TEXT }}>Your referral link</h3>
                    <p className="text-xs" style={{ color: LI_MUTED }}>Earn 7 days Pro free for each friend you refer</p>
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
                    <FaCopy /> Copy
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'Total Referrals', value: referrals.referralCount },
                    { label: 'Reward Days', value: referrals.referralReward },
                    { label: 'Your Code', value: user?.referralCode },
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
                      Referred Users ({referrals.referrals.length})
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

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: LI_BORDER }}>
                <FaGear style={{ color: LI_BLUE }} />
                <h2 className="font-semibold text-base" style={{ color: LI_TEXT }}>Account Settings</h2>
              </div>
              <div className="p-5 max-w-sm space-y-0 divide-y" style={{ borderColor: LI_BORDER }}>
                {[
                  { label: 'Full name',     value: user?.name },
                  { label: 'Email',         value: user?.email },
                  { label: 'Member since',  value: new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
                  { label: 'Plan',          value: planStyle.label },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <span className="text-sm" style={{ color: LI_MUTED }}>{label}</span>
                    <span className="text-sm font-medium" style={{ color: LI_TEXT }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                {plan === 'free' ? (
                  <Link to="/pricing"
                    className="block w-full text-center py-2.5 rounded-full font-semibold text-sm"
                    style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
                    Upgrade to Pro — $9.99/mo
                  </Link>
                ) : (
                  <button className="w-full text-sm py-2 rounded-full border font-medium"
                    style={{ borderColor: '#CC1016', color: '#CC1016' }}>
                    Cancel subscription
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
