import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FaUsers, FaTableCells, FaArrowTrendUp, FaStar, FaMagnifyingGlass,
  FaToggleOn, FaToggleOff, FaTrash, FaHouse, FaShieldHalved,
  FaChartPie, FaGear, FaPen, FaChartBar, FaCheck, FaXmark
} from 'react-icons/fa6';

const PLAN_COLORS = {
  free:       'bg-gray-100 text-gray-600',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
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
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data));
    api.get('/admin/marketing').then(r => setMarketing(r.data));
  }, []);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [tab, search, filterPlan, filterRole]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterPlan) params.set('plan', filterPlan);
      if (filterRole) params.set('role', filterRole);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
    } finally {
      setLoadingUsers(false);
    }
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

  const toggleActive = async (id, currentStatus) => {
    const { data } = await api.put(`/admin/users/${id}/toggle-active`);
    toast.success(data.message);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) return;
    await api.delete(`/admin/users/${id}`);
    toast.success('تم حذف المستخدم');
    fetchUsers();
  };

  const navItems = [
    { id: 'overview', label: 'الإحصائيات', icon: FaChartBar },
    { id: 'users',    label: 'المستخدمون', icon: FaUsers },
    { id: 'marketing',label: 'التسويق',    icon: FaArrowTrendUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-l border-gray-200 flex flex-col fixed h-full">
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">C</div>
            <span className="font-black text-gray-800">CheckColors</span>
          </Link>
          <div className="flex items-center gap-1.5 mt-2">
            <FaShieldHalved className="text-red-500 text-xs" />
            <span className="text-xs text-red-500 font-semibold">لوحة الإدارة</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <Icon className="text-sm" /> {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition">
            <FaHouse /> الموقع الرئيسي
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition">
            <FaXmark /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-56 p-6">
        {/* Overview */}
        {tab === 'overview' && stats && (
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-6">نظرة عامة</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { icon: FaUsers,      label: 'إجمالي المستخدمين', value: stats.totalUsers,          color: 'text-blue-600',   bg: 'bg-blue-50' },
                { icon: FaTableCells, label: 'إجمالي الباليتات',  value: stats.totalPalettes,        color: 'text-green-600',  bg: 'bg-green-50' },
                { icon: FaStar,       label: 'مشتركو Pro',        value: stats.subscriptions.pro,    color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { icon: FaArrowTrendUp, label: 'جدد هذا الشهر',  value: stats.newThisMonth,         color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`${color} text-lg`} />
                  </div>
                  <div className="text-3xl font-black text-gray-800">{value}</div>
                  <div className="text-gray-500 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><FaChartPie className="text-gray-400" /> توزيع الاشتراكات</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(stats.subscriptions).map(([plan, count]) => (
                  <div key={plan} className={`rounded-xl p-4 text-center ${PLAN_COLORS[plan].split(' ')[0]}`}>
                    <div className="text-3xl font-black text-gray-800">{count}</div>
                    <div className={`text-sm font-semibold mt-1 capitalize ${PLAN_COLORS[plan].split(' ')[1]}`}>{plan}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <h2 className="text-xl font-black text-gray-800 flex-1">إدارة المستخدمين</h2>
              <div className="relative">
                <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..."
                  className="border border-gray-200 rounded-xl pr-8 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
              </div>
              <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">كل الخطط</option>
                {['free','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">كل الأدوار</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {loadingUsers ? (
                <div className="p-8 text-center text-gray-400">جارٍ التحميل...</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['المستخدم','الخطة','الدور','الحالة','إجراءات'].map(h => (
                        <th key={h} className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                              {u.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{u.name}</p>
                              <p className="text-gray-400 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select value={u.subscription?.plan || 'free'} onChange={e => updatePlan(u._id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${PLAN_COLORS[u.subscription?.plan || 'free']}`}>
                            {['free','pro','enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select value={u.role} onChange={e => updateRole(u._id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {u.isActive ? <><FaCheck className="text-[10px]" /> نشط</> : <><FaXmark className="text-[10px]" /> موقوف</>}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleActive(u._id, u.isActive)} title={u.isActive ? 'إيقاف' : 'تفعيل'}
                              className={`text-lg transition ${u.isActive ? 'text-green-500 hover:text-gray-400' : 'text-gray-300 hover:text-green-500'}`}>
                              {u.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button onClick={() => deleteUser(u._id)} title="حذف المستخدم"
                              className="text-gray-300 hover:text-red-500 transition">
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

        {/* Marketing */}
        {tab === 'marketing' && marketing && (
          <div>
            <h2 className="text-xl font-black text-gray-800 mb-6">إحصائيات التسويق والإحالات</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'إجمالي الإحالات',  value: marketing.totalReferrals,    icon: FaUsers,       color: 'text-blue-600',   bg: 'bg-blue-50' },
                { label: 'تحويلات مدفوعة',   value: marketing.paidConversions,   icon: FaStar,        color: 'text-green-600',  bg: 'bg-green-50' },
                { label: 'معدل التحويل',     value: marketing.totalReferrals > 0 ? `${Math.round(marketing.paidConversions / marketing.totalReferrals * 100)}%` : '0%', icon: FaArrowTrendUp, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className={`${color} text-lg`} />
                  </div>
                  <div className="text-3xl font-black text-gray-800">{value}</div>
                  <div className="text-gray-500 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-5">أعلى المُحيلين</h3>
              {marketing.topReferrers.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">لا توجد إحالات بعد</p>
              ) : (
                <div className="space-y-3">
                  {marketing.topReferrers.map((r, i) => (
                    <div key={r._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800">{r.referralCount} إحالة</p>
                        <p className="text-xs text-blue-600 font-mono">{r.referralCode}</p>
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
