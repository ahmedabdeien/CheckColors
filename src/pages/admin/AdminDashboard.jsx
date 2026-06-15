import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import CheckColorsLogo from '../../assets/cc-logo.svg';
import {
  FaUsers, FaTableCells, FaArrowTrendUp, FaStar, FaMagnifyingGlass,
  FaToggleOn, FaToggleOff, FaTrash, FaHouse, FaShieldHalved,
  FaChartPie, FaChartBar, FaCheck, FaXmark, FaRightFromBracket,
  FaBriefcase, FaFileArrowDown, FaDollarSign, FaPalette, FaBookmark,
  FaAngleDown, FaAngleUp, FaCircleInfo, FaGear, FaBell, FaWandMagicSparkles,
  FaUserPlus, FaCalendarDays,
} from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const PLAN_STYLE = {
  free:       { bg: '#F3F2EF', color: '#00000099'  },
  pro:        { bg: '#EEF3F8', color: LI_BLUE      },
  enterprise: { bg: '#F5F0FF', color: '#5B4FE8'    },
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [marketing, setMarketing] = useState(null);
  const [tab, setTab]           = useState('overview');
  const [search, setSearch]     = useState('');
  const [filterPlan, setFilterPlan]   = useState('');
  const [filterRole, setFilterRole]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [expandedUser, setExpandedUser] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
    api.get('/admin/marketing').then(r => setMarketing(r.data));
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    if (tab === 'palettes') fetchPalettes();
  }, [tab, search, filterPlan, filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search) p.set('search', search);
      if (filterPlan) p.set('plan', filterPlan);
      if (filterRole) p.set('role', filterRole);
      const { data } = await api.get(`/admin/users?${p}`);
      setUsers(data.users);
    } finally { setLoading(false); }
  };

  const fetchPalettes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/palettes/public?limit=50');
      setPalettes(data.palettes || []);
    } finally { setLoading(false); }
  };

  const updatePlan   = async (id, plan) => { await api.put(`/admin/users/${id}/plan`, { plan }); toast.success('Plan updated'); fetchUsers(); };
  const updateRole   = async (id, role) => { await api.put(`/admin/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); };
  const toggleActive = async (id) => { const { data } = await api.put(`/admin/users/${id}/toggle-active`); toast.success(data.message); fetchUsers(); };
  const deleteUser   = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('User deleted');
    fetchUsers();
  };

  const exportCSV = async () => {
    try {
      const p = new URLSearchParams();
      if (filterPlan) p.set('plan', filterPlan);
      if (filterRole) p.set('role', filterRole);
      const { data } = await api.get(`/admin/users?${p}&limit=9999`);
      const rows = data.users.map(u => [
        u.name, u.email, u.role,
        u.subscription?.plan || 'free',
        u.isActive ? 'Active' : 'Suspended',
        new Date(u.createdAt).toLocaleDateString(),
      ]);
      const csv = ['Name,Email,Role,Plan,Status,Joined', ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'checkcolors-users.csv'; a.click();
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  const navItems = [
    { id: 'overview',   label: 'Overview',   icon: FaChartBar },
    { id: 'users',      label: 'Members',    icon: FaUsers },
    { id: 'palettes',   label: 'Palettes',   icon: FaPalette },
    { id: 'marketing',  label: 'Marketing',  icon: FaArrowTrendUp },
    { id: 'analytics',  label: 'Analytics',  icon: FaChartPie },
    { id: 'settings',   label: 'Settings',   icon: FaGear },
  ];

  const StatCard = ({ icon: Icon, label, value, bg, color, sub }) => (
    <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="text-base" style={{ color }} />
        </div>
        {sub && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color }}>{sub}</span>}
      </div>
      <p className="text-2xl font-bold" style={{ color: LI_TEXT }}>{value ?? '—'}</p>
      <p className="text-xs mt-1" style={{ color: LI_MUTED }}>{label}</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="flex">
      {/* ── Sidebar ── */}
      <aside className="w-52 bg-white border-r flex-shrink-0 flex flex-col fixed h-full z-10"
        style={{ borderColor: LI_BORDER }}>
        <div className="p-4 border-b" style={{ borderColor: LI_BORDER }}>
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img src={CheckColorsLogo} alt="CheckColors" className="w-8 h-8" />
            <span className="font-bold text-sm" style={{ color: LI_TEXT }}>CheckColors</span>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ backgroundColor: '#FFEBE9' }}>
            <FaShieldHalved className="text-xs" style={{ color: '#CC1016' }} />
            <span className="text-xs font-semibold" style={{ color: '#CC1016' }}>Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: tab === id ? '#EEF3F8' : 'transparent',
                color: tab === id ? LI_BLUE : LI_MUTED,
              }}>
              <Icon className="text-sm" /> {label}
            </button>
          ))}
        </nav>

        {/* Stats summary in sidebar */}
        {stats && (
          <div className="p-3 border-t" style={{ borderColor: LI_BORDER }}>
            <div className="space-y-1.5">
              {[
                { label: 'Members', value: stats.totalUsers, color: LI_BLUE },
                { label: 'Palettes', value: stats.totalPalettes, color: '#057642' },
                { label: 'Pro+', value: (stats.subscriptions?.pro || 0) + (stats.subscriptions?.enterprise || 0), color: '#915907' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center px-2 py-1 rounded-md" style={{ backgroundColor: '#F9F9F9' }}>
                  <span className="text-[11px]" style={{ color: LI_MUTED }}>{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t space-y-0.5" style={{ borderColor: LI_BORDER }}>
          <Link to="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors"
            style={{ color: LI_MUTED }}>
            <FaHouse /> Back to site
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors"
            style={{ color: '#CC1016' }}>
            <FaRightFromBracket /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 ml-52 p-6 min-h-screen">

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && stats && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-xl font-bold" style={{ color: LI_TEXT }}>Overview</h1>
              <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <StatCard icon={FaUsers}       label="Total Members"   value={stats.totalUsers}              bg="#EEF3F8" color={LI_BLUE}   sub={`+${stats.newThisMonth} this month`} />
              <StatCard icon={FaTableCells}  label="Total Palettes"  value={stats.totalPalettes}           bg="#F0FFF6" color="#057642" />
              <StatCard icon={FaStar}        label="Pro Subscribers" value={stats.subscriptions?.pro}      bg="#FFF9F0" color="#915907" />
              <StatCard icon={FaArrowTrendUp} label="Enterprise"     value={stats.subscriptions?.enterprise} bg="#F5F0FF" color="#5B4FE8" />
            </div>

            {/* Revenue + Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Revenue */}
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaDollarSign style={{ color: '#057642' }} /> Revenue Estimate
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Pro subscribers', count: stats.subscriptions?.pro || 0, rate: 9.99, color: LI_BLUE },
                    { label: 'Enterprise subscribers', count: stats.subscriptions?.enterprise || 0, rate: 49, color: '#5B4FE8' },
                  ].map(({ label, count, rate, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                      style={{ borderColor: LI_BORDER }}>
                      <div>
                        <p className="text-xs font-medium" style={{ color: LI_TEXT }}>{label}</p>
                        <p className="text-[10px]" style={{ color: LI_MUTED }}>{count} × ${rate}/mo</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color }}>${(count * rate).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold" style={{ color: LI_TEXT }}>Est. MRR</span>
                    <span className="text-xl font-bold" style={{ color: '#057642' }}>
                      ${((stats.subscriptions?.pro || 0) * 9.99 + (stats.subscriptions?.enterprise || 0) * 49).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaChartPie style={{ color: LI_BLUE }} /> Subscription Distribution
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.subscriptions || {}).map(([plan, count]) => {
                    const total = Object.values(stats.subscriptions || {}).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold capitalize" style={{ color: PLAN_STYLE[plan]?.color || LI_MUTED }}>{plan}</span>
                          <span style={{ color: LI_MUTED }}>{count} users · {pct}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: '#F3F2EF' }}>
                          <div className="h-2 rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: PLAN_STYLE[plan]?.color || LI_MUTED }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: LI_TEXT }}>Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Manage Members', icon: FaUsers, action: () => setTab('users'), color: LI_BLUE },
                  { label: 'View Palettes', icon: FaPalette, action: () => setTab('palettes'), color: '#7C3AED' },
                  { label: 'Marketing', icon: FaArrowTrendUp, action: () => setTab('marketing'), color: '#057642' },
                  { label: 'Export Users CSV', icon: FaFileArrowDown, action: exportCSV, color: '#D97706' },
                ].map(({ label, icon: Icon, action, color }) => (
                  <button key={label} onClick={action}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ border: `1px solid ${LI_BORDER}`, color, backgroundColor: color + '0D' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = color + '18'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = color + '0D'}>
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MEMBERS ── */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-5">
              <h1 className="text-xl font-bold flex-1" style={{ color: LI_TEXT }}>Manage Members</h1>
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border font-semibold transition-colors"
                style={{ borderColor: LI_BORDER, color: '#057642' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0FFF6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <FaFileArrowDown /> Export CSV
              </button>
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                  className="pl-8 pr-3 py-2 text-sm rounded-md outline-none w-48"
                  style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                  onFocus={e => e.target.style.borderColor = LI_BLUE}
                  onBlur={e => e.target.style.borderColor = LI_BORDER} />
              </div>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                className="px-3 py-2 text-sm rounded-md outline-none"
                style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}>
                <option value="">All plans</option>
                {['free','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="px-3 py-2 text-sm rounded-md outline-none"
                style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}>
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              {loading ? (
                <div className="p-10 text-center text-sm" style={{ color: LI_MUTED }}>Loading...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: '#F3F2EF', borderBottom: `1px solid ${LI_BORDER}` }}>
                    <tr>
                      {['Member', 'Plan', 'Role', 'Saved Colors', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase"
                          style={{ color: LI_MUTED }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <>
                        <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                          style={{ borderColor: '#F3F2EF' }}
                          onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                style={{ backgroundColor: LI_BLUE }}>
                                {u.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-xs" style={{ color: LI_TEXT }}>{u.name}</p>
                                <p className="text-[11px]" style={{ color: LI_MUTED }}>{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <select value={u.subscription?.plan || 'free'} onChange={e => updatePlan(u._id, e.target.value)}
                              className="text-xs font-semibold px-2 py-1 rounded cursor-pointer outline-none"
                              style={{ ...PLAN_STYLE[u.subscription?.plan || 'free'], border: 'none' }}>
                              {['free','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                              className="text-xs font-semibold px-2 py-1 rounded cursor-pointer outline-none"
                              style={{
                                border: 'none',
                                backgroundColor: u.role === 'admin' ? '#FFEBE9' : '#F3F2EF',
                                color: u.role === 'admin' ? '#CC1016' : LI_MUTED,
                              }}>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs" style={{ color: LI_MUTED }}>
                              <FaBookmark size={10} style={{ color: LI_BLUE }} />
                              {u.savedColors?.length || 0}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-sm"
                              style={{
                                backgroundColor: u.isActive ? '#F0FFF6' : '#FFF0F0',
                                color: u.isActive ? '#057642' : '#CC1016',
                              }}>
                              {u.isActive ? <><FaCheck className="text-[9px]" /> Active</> : <><FaXmark className="text-[9px]" /> Suspended</>}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs" style={{ color: LI_MUTED }}>
                              {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              <button onClick={() => toggleActive(u._id)} title={u.isActive ? 'Suspend' : 'Activate'}
                                className="text-xl transition-colors"
                                style={{ color: u.isActive ? '#057642' : '#B0B0B0' }}>
                                {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                              </button>
                              <button onClick={() => deleteUser(u._id)} title="Delete"
                                className="p-1 rounded transition-colors"
                                style={{ color: '#B0B0B0' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#CC1016'}
                                onMouseLeave={e => e.currentTarget.style.color = '#B0B0B0'}>
                                <FaTrash className="text-xs" />
                              </button>
                              {expandedUser === u._id ? <FaAngleUp size={11} style={{ color: LI_MUTED }} /> : <FaAngleDown size={11} style={{ color: LI_MUTED }} />}
                            </div>
                          </td>
                        </tr>
                        {/* Expanded row — saved colors preview */}
                        {expandedUser === u._id && (
                          <tr key={`${u._id}-expanded`} style={{ backgroundColor: '#F9F9F9', borderBottom: `1px solid ${LI_BORDER}` }}>
                            <td colSpan={7} className="px-6 py-4">
                              <p className="text-xs font-semibold mb-2" style={{ color: LI_MUTED }}>
                                Saved Colors ({u.savedColors?.length || 0})
                              </p>
                              {u.savedColors?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {u.savedColors.slice(0, 20).map(c => (
                                    <div key={c._id} title={c.hex}
                                      className="w-7 h-7 rounded-md border"
                                      style={{ backgroundColor: c.hex, borderColor: LI_BORDER }} />
                                  ))}
                                  {u.savedColors.length > 20 && (
                                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-semibold"
                                      style={{ backgroundColor: LI_BG, color: LI_MUTED, border: `1px solid ${LI_BORDER}` }}>
                                      +{u.savedColors.length - 20}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs" style={{ color: LI_MUTED }}>No saved colors</p>
                              )}
                              <div className="mt-2 flex gap-4 text-xs" style={{ color: LI_MUTED }}>
                                <span>AI generations: <b style={{ color: LI_TEXT }}>{u.aiGenerations || 0}</b></span>
                                <span>Referrals: <b style={{ color: LI_TEXT }}>{u.referralCount || 0}</b></span>
                                <span>Code: <b className="font-mono" style={{ color: LI_BLUE }}>{u.referralCode}</b></span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && users.length === 0 && (
                <div className="text-center py-12" style={{ color: LI_MUTED }}>
                  <FaUsers className="mx-auto text-2xl mb-2 opacity-30" />
                  <p className="text-sm">No members found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PALETTES ── */}
        {tab === 'palettes' && (
          <div>
            <h1 className="text-xl font-bold mb-5" style={{ color: LI_TEXT }}>All Palettes</h1>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ backgroundColor: '#E0DFDC' }} />)}
              </div>
            ) : palettes.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center" style={{ border: `1px solid ${LI_BORDER}` }}>
                <FaPalette className="mx-auto text-3xl mb-3 opacity-20" style={{ color: LI_TEXT }} />
                <p className="text-sm" style={{ color: LI_MUTED }}>No palettes yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {palettes.map(p => (
                  <div key={p._id} className="bg-white rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${LI_BORDER}` }}>
                    <div className="flex" style={{ height: 64 }}>
                      {p.colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold truncate" style={{ color: LI_TEXT }}>{p.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: LI_MUTED }}>{p.colors.length} colors · {p.user?.name || 'Anonymous'}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {p.colors.map((c, i) => (
                          <span key={i} className="text-[9px] font-mono px-1 py-0.5 rounded"
                            style={{ backgroundColor: LI_BG, color: LI_MUTED }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MARKETING ── */}
        {tab === 'marketing' && marketing && (
          <div>
            <h1 className="text-xl font-bold mb-5" style={{ color: LI_TEXT }}>Marketing & Referrals</h1>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <StatCard icon={FaUsers}        label="Total Referrals"   value={marketing.totalReferrals}  bg="#EEF3F8" color={LI_BLUE} />
              <StatCard icon={FaBriefcase}    label="Paid Conversions"  value={marketing.paidConversions} bg="#F0FFF6" color="#057642" />
              <StatCard icon={FaArrowTrendUp} label="Conversion Rate"   value={
                marketing.totalReferrals > 0
                  ? `${Math.round(marketing.paidConversions / marketing.totalReferrals * 100)}%`
                  : '0%'
              } bg="#F5F0FF" color="#5B4FE8" />
            </div>

            <div className="bg-white rounded-xl" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: LI_BORDER }}>
                <h3 className="font-semibold text-sm" style={{ color: LI_TEXT }}>Top Referrers</h3>
              </div>
              {marketing.topReferrers.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: LI_MUTED }}>No referrals yet</p>
              ) : (
                <div className="divide-y" style={{ borderColor: LI_BORDER }}>
                  {marketing.topReferrers.map((r, i) => (
                    <div key={r._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                      <span className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: i === 0 ? '#915907' : i === 1 ? '#666' : '#CD7F32' }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: LI_TEXT }}>{r.name}</p>
                        <p className="text-xs" style={{ color: LI_MUTED }}>{r.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold" style={{ color: LI_TEXT }}>{r.referralCount} referrals</p>
                        <p className="text-xs font-mono" style={{ color: LI_BLUE }}>{r.referralCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && stats && (
          <div>
            <h1 className="text-xl font-bold mb-5" style={{ color: LI_TEXT }}>Analytics</h1>

            {/* Plan conversion funnel */}
            <div className="bg-white rounded-xl p-5 mb-5" style={{ border: `1px solid ${LI_BORDER}` }}>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                <FaChartBar style={{ color: LI_BLUE }} /> Plan Conversion Funnel
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Registered', value: stats.totalUsers, color: LI_BLUE, max: stats.totalUsers },
                  { label: 'Free Plan', value: stats.subscriptions?.free || 0, color: '#868E96', max: stats.totalUsers },
                  { label: 'Pro Plan', value: stats.subscriptions?.pro || 0, color: '#915907', max: stats.totalUsers },
                  { label: 'Enterprise', value: stats.subscriptions?.enterprise || 0, color: '#5B4FE8', max: stats.totalUsers },
                ].map(({ label, value, color, max }) => {
                  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium" style={{ color: LI_TEXT }}>{label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color }}>{value}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: color + '15', color }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F2EF' }}>
                        <div className="h-3 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaDollarSign style={{ color: '#057642' }} /> Revenue Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Monthly (Pro)', value: ((stats.subscriptions?.pro || 0) * 9.99).toFixed(2), color: LI_BLUE },
                    { label: 'Monthly (Enterprise)', value: ((stats.subscriptions?.enterprise || 0) * 49).toFixed(2), color: '#5B4FE8' },
                    { label: 'Annual (Pro × 12)', value: ((stats.subscriptions?.pro || 0) * 9.99 * 12).toFixed(2), color: '#057642' },
                    { label: 'Annual (Enterprise × 12)', value: ((stats.subscriptions?.enterprise || 0) * 49 * 12).toFixed(2), color: '#915907' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b last:border-0"
                      style={{ borderColor: LI_BORDER }}>
                      <span className="text-xs" style={{ color: LI_MUTED }}>{label}</span>
                      <span className="text-sm font-bold" style={{ color }}>${value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaWandMagicSparkles style={{ color: '#7C3AED' }} /> Feature Usage
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Total Palettes Created', value: stats.totalPalettes, icon: FaPalette, color: LI_BLUE },
                    { label: 'Active Members', value: stats.totalUsers, icon: FaUsers, color: '#057642' },
                    { label: 'New This Month', value: stats.newThisMonth, icon: FaUserPlus, color: '#915907' },
                    { label: 'Total Referrals', value: stats.totalReferrals || 0, icon: FaBriefcase, color: '#5B4FE8' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b last:border-0"
                      style={{ borderColor: LI_BORDER }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: color + '15' }}>
                          <Icon size={12} style={{ color }} />
                        </div>
                        <span className="text-xs" style={{ color: LI_MUTED }}>{label}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: LI_TEXT }}>{value ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Growth metrics */}
            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                <FaArrowTrendUp style={{ color: '#057642' }} /> Key Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Avg palettes/user', value: stats.totalUsers > 0 ? (stats.totalPalettes / stats.totalUsers).toFixed(1) : '0', color: LI_BLUE },
                  { label: 'Conversion rate', value: stats.totalUsers > 0 ? `${Math.round(((stats.subscriptions?.pro || 0) + (stats.subscriptions?.enterprise || 0)) / stats.totalUsers * 100)}%` : '0%', color: '#057642' },
                  { label: 'Enterprise share', value: stats.totalUsers > 0 ? `${Math.round((stats.subscriptions?.enterprise || 0) / stats.totalUsers * 100)}%` : '0%', color: '#5B4FE8' },
                  { label: 'ARPU (monthly)', value: stats.totalUsers > 0 ? `$${(((stats.subscriptions?.pro || 0) * 9.99 + (stats.subscriptions?.enterprise || 0) * 49) / stats.totalUsers).toFixed(2)}` : '$0', color: '#915907' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-4 text-center" style={{ backgroundColor: '#F9F9F9' }}>
                    <p className="text-2xl font-bold mb-1" style={{ color }}>{value}</p>
                    <p className="text-[11px] leading-tight" style={{ color: LI_MUTED }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div>
            <h1 className="text-xl font-bold mb-5" style={{ color: LI_TEXT }}>Admin Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* App info */}
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaCircleInfo style={{ color: LI_BLUE }} /> Application Info
                </h3>
                <div className="space-y-0 divide-y" style={{ borderColor: LI_BORDER }}>
                  {[
                    { label: 'App Name', value: 'CheckColors' },
                    { label: 'Version', value: '1.0.0' },
                    { label: 'Environment', value: import.meta.env.MODE || 'production' },
                    { label: 'Backend', value: import.meta.env.VITE_API_URL || 'Configured' },
                    { label: 'AI Provider', value: 'Groq · LLaMA 3.3 70B' },
                    { label: 'Database', value: 'MongoDB Atlas' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3">
                      <span className="text-sm" style={{ color: LI_MUTED }}>{label}</span>
                      <span className="text-sm font-medium font-mono" style={{ color: LI_TEXT }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan limits */}
              <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                  <FaGear style={{ color: LI_BLUE }} /> Plan Limits
                </h3>
                <div className="space-y-3">
                  {[
                    { plan: 'Free', palettes: 10, ai: 5, color: '#868E96' },
                    { plan: 'Pro', palettes: '∞', ai: 100, color: LI_BLUE },
                    { plan: 'Enterprise', palettes: '∞', ai: '∞', color: '#5B4FE8' },
                  ].map(({ plan, palettes, ai, color }) => (
                    <div key={plan} className="rounded-xl p-4" style={{ backgroundColor: '#F9F9F9', border: `1px solid ${LI_BORDER}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold" style={{ color }}>{plan}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: color + '15', color }}>Active</span>
                      </div>
                      <div className="flex gap-4 text-xs" style={{ color: LI_MUTED }}>
                        <span>Palettes: <b style={{ color: LI_TEXT }}>{palettes}</b></span>
                        <span>AI/month: <b style={{ color: LI_TEXT }}>{ai}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-xl p-5 lg:col-span-2" style={{ border: `1px solid #CC1016` }}>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: '#CC1016' }}>
                  <FaBell style={{ color: '#CC1016' }} /> Danger Zone
                </h3>
                <p className="text-xs mb-4" style={{ color: LI_MUTED }}>These actions are irreversible. Proceed with caution.</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    'Clear all AI generation counters',
                    'Reset all referral rewards',
                    'Export full database backup',
                  ].map(action => (
                    <button key={action}
                      className="text-xs px-4 py-2 rounded-lg border font-medium transition-colors"
                      style={{ borderColor: '#CC1016', color: '#CC1016' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF0F0'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => alert(`Action: ${action} — connect to backend API`)}>
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
