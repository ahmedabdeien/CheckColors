import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaUsers, FaTableCells, FaArrowTrendUp, FaStar, FaMagnifyingGlass,
  FaToggleOn, FaToggleOff, FaTrash, FaHouse, FaShieldHalved,
  FaChartPie, FaChartBar, FaCheck, FaXmark, FaRightFromBracket,
  FaBriefcase
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
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [marketing, setMarketing] = useState(null);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
    api.get('/admin/marketing').then(r => setMarketing(r.data));
  }, []);

  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, search, filterPlan, filterRole]);

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

  const updatePlan = async (id, plan) => { await api.put(`/admin/users/${id}/plan`, { plan }); toast.success('Plan updated'); fetchUsers(); };
  const updateRole = async (id, role) => { await api.put(`/admin/users/${id}/role`, { role }); toast.success('Role updated'); fetchUsers(); };
  const toggleActive = async (id) => { const { data } = await api.put(`/admin/users/${id}/toggle-active`); toast.success(data.message); fetchUsers(); };
  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('User deleted');
    fetchUsers();
  };

  const navItems = [
    { id: 'overview',  label: 'Overview',   icon: FaChartBar },
    { id: 'users',     label: 'Members',    icon: FaUsers },
    { id: 'marketing', label: 'Marketing',  icon: FaArrowTrendUp },
  ];

  const StatCard = ({ icon: Icon, label, value, bg, color }) => (
    <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
        <Icon className="text-base" style={{ color }} />
      </div>
      <p className="text-2xl font-bold" style={{ color: LI_TEXT }}>{value ?? '—'}</p>
      <p className="text-xs mt-1" style={{ color: LI_MUTED }}>{label}</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} className="flex">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r flex-shrink-0 flex flex-col fixed h-full"
        style={{ borderColor: LI_BORDER }}>
        <div className="p-4 border-b" style={{ borderColor: LI_BORDER }}>
          <Link to="/" className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: LI_BLUE }}>C</div>
            <span className="font-bold text-sm" style={{ color: LI_TEXT }}>CheckColors</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <FaShieldHalved className="text-xs" style={{ color: '#CC1016' }} />
            <span className="text-xs font-semibold" style={{ color: '#CC1016' }}>Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
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

      {/* Main */}
      <main className="flex-1 ml-52 p-6">

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div>
            <h1 className="text-xl font-bold mb-5" style={{ color: LI_TEXT }}>Overview</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <StatCard icon={FaUsers}       label="Total Members"    value={stats.totalUsers}       bg="#EEF3F8" color={LI_BLUE} />
              <StatCard icon={FaTableCells}  label="Total Palettes"   value={stats.totalPalettes}    bg="#F0FFF6" color="#057642" />
              <StatCard icon={FaStar}        label="Pro Subscribers"  value={stats.subscriptions?.pro} bg="#FFF9F0" color="#915907" />
              <StatCard icon={FaArrowTrendUp} label="New This Month"  value={stats.newThisMonth}     bg="#F5F0FF" color="#5B4FE8" />
            </div>

            <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LI_BORDER}` }}>
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: LI_TEXT }}>
                <FaChartPie style={{ color: LI_BLUE }} /> Subscription Distribution
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(stats.subscriptions || {}).map(([plan, count]) => (
                  <div key={plan} className="rounded-xl p-4 text-center" style={{ backgroundColor: PLAN_STYLE[plan]?.bg || '#F3F2EF' }}>
                    <p className="text-2xl font-bold" style={{ color: LI_TEXT }}>{count}</p>
                    <p className="text-xs font-semibold mt-1 capitalize" style={{ color: PLAN_STYLE[plan]?.color || LI_MUTED }}>{plan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-5">
              <h1 className="text-xl font-bold flex-1" style={{ color: LI_TEXT }}>Manage Members</h1>
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: LI_MUTED }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
                  className="pl-8 pr-3 py-2 text-sm rounded-md outline-none w-48"
                  style={{ border: `1px solid ${LI_BORDER}`, color: LI_TEXT }}
                  onFocus={e => e.target.style.borderColor = LI_BLUE}
                  onBlur={e => e.target.style.borderColor = LI_BORDER}
                />
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
                      {['Member', 'Plan', 'Role', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase"
                          style={{ color: LI_MUTED }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors"
                        style={{ borderColor: '#F3F2EF' }}>
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
                        <td className="px-4 py-3">
                          <select value={u.subscription?.plan || 'free'} onChange={e => updatePlan(u._id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1 rounded cursor-pointer outline-none"
                            style={{ ...PLAN_STYLE[u.subscription?.plan || 'free'], border: 'none' }}>
                            {['free','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
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
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-sm"
                            style={{
                              backgroundColor: u.isActive ? '#F0FFF6' : '#FFF0F0',
                              color: u.isActive ? '#057642' : '#CC1016',
                            }}>
                            {u.isActive ? <><FaCheck className="text-[9px]" /> Active</> : <><FaXmark className="text-[9px]" /> Suspended</>}
                          </span>
                        </td>
                        <td className="px-4 py-3">
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* MARKETING */}
        {tab === 'marketing' && marketing && (
          <div>
            <h1 className="text-xl font-bold mb-5" style={{ color: LI_TEXT }}>Marketing & Referrals</h1>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <StatCard icon={FaUsers}       label="Total Referrals"   value={marketing.totalReferrals}  bg="#EEF3F8" color={LI_BLUE} />
              <StatCard icon={FaBriefcase}   label="Paid Conversions"  value={marketing.paidConversions} bg="#F0FFF6" color="#057642" />
              <StatCard icon={FaArrowTrendUp} label="Conversion Rate"  value={
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
                        style={{ backgroundColor: LI_BLUE }}>
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
      </main>
    </div>
  );
}
