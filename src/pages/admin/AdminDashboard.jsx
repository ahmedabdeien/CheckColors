import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUsers, FiGrid, FiTrendingUp, FiStar, FiSearch, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';

const PLAN_OPTIONS = ['free', 'pro', 'enterprise'];
const ROLE_OPTIONS = ['user', 'admin'];

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [marketing, setMarketing] = useState(null);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
    api.get('/admin/marketing').then(r => setMarketing(r.data));
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [tab, search, filterPlan]);

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterPlan) params.set('plan', filterPlan);
    const { data } = await api.get(`/admin/users?${params}`);
    setUsers(data.users);
  };

  const updatePlan = async (id, plan) => {
    await api.put(`/admin/users/${id}/plan`, { plan });
    toast.success('تم تحديث الخطة');
    fetchUsers();
  };

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    toast.success('تم تحديث الدور');
    fetchUsers();
  };

  const toggleActive = async (id) => {
    const { data } = await api.put(`/admin/users/${id}/toggle-active`);
    toast.success(data.message);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('تم الحذف');
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <header className="border-b border-white/10 bg-slate-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-slate-400 hover:text-white text-sm">← الموقع</Link>
          <span className="text-white font-bold">لوحة الإدارة</span>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-white text-sm">خروج</button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-52 border-l border-white/10 bg-slate-900/50 min-h-[calc(100vh-49px)] p-4">
          {[
            { id: 'overview', label: 'الإحصائيات', icon: FiTrendingUp },
            { id: 'users', label: 'المستخدمون', icon: FiUsers },
            { id: 'marketing', label: 'التسويق', icon: FiStar },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition mb-1 ${tab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6">
          {/* Overview */}
          {tab === 'overview' && stats && (
            <div>
              <h2 className="text-xl font-bold mb-6">الإحصائيات العامة</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-400' },
                  { label: 'إجمالي الباليتات', value: stats.totalPalettes, icon: FiGrid, color: 'text-green-400' },
                  { label: 'مستخدمي Pro', value: stats.subscriptions.pro, icon: FiStar, color: 'text-yellow-400' },
                  { label: 'جدد هذا الشهر', value: stats.newThisMonth, icon: FiTrendingUp, color: 'text-indigo-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <Icon className={`${color} mb-2`} size={20} />
                    <div className="text-3xl font-black">{value}</div>
                    <div className="text-slate-400 text-sm mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold mb-4">توزيع الاشتراكات</h3>
                <div className="flex gap-3">
                  {Object.entries(stats.subscriptions).map(([plan, count]) => (
                    <div key={plan} className="flex-1 text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-slate-400 text-sm capitalize">{plan}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold flex-1">المستخدمون</h2>
                <div className="relative">
                  <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
                    className="bg-white/5 border border-white/10 rounded-lg pr-8 pl-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                </div>
                <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="">كل الخطط</option>
                  {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-white/10">
                      <th className="text-right py-3 px-2">المستخدم</th>
                      <th className="text-right py-3 px-2">الخطة</th>
                      <th className="text-right py-3 px-2">الدور</th>
                      <th className="text-right py-3 px-2">الحالة</th>
                      <th className="text-right py-3 px-2">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-white/5 hover:bg-white/2">
                        <td className="py-3 px-2">
                          <div className="font-medium">{u.name}</div>
                          <div className="text-slate-500 text-xs">{u.email}</div>
                        </td>
                        <td className="py-3 px-2">
                          <select value={u.subscription?.plan} onChange={e => updatePlan(u._id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white">
                            {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white">
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {u.isActive ? 'نشط' : 'موقوف'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleActive(u._id)} className="text-slate-400 hover:text-white transition">
                              {u.isActive ? <FiToggleRight size={18} className="text-green-400" /> : <FiToggleLeft size={18} />}
                            </button>
                            <button onClick={() => deleteUser(u._id)} className="text-slate-400 hover:text-red-400 transition">
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Marketing */}
          {tab === 'marketing' && marketing && (
            <div>
              <h2 className="text-xl font-bold mb-6">إحصائيات التسويق والإحالات</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-black">{marketing.totalReferrals}</div>
                  <div className="text-slate-400 text-sm mt-1">إجمالي الإحالات</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-black">{marketing.paidConversions}</div>
                  <div className="text-slate-400 text-sm mt-1">تحويلات مدفوعة</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="text-3xl font-black">
                    {marketing.totalReferrals > 0 ? Math.round((marketing.paidConversions / marketing.totalReferrals) * 100) : 0}%
                  </div>
                  <div className="text-slate-400 text-sm mt-1">معدل التحويل</div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold mb-4">أعلى المُحيلين</h3>
                <div className="space-y-3">
                  {marketing.topReferrers.map((r, i) => (
                    <div key={r._id} className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm w-5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{r.referralCount} إحالة</p>
                        <p className="text-xs text-indigo-400">كود: {r.referralCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
