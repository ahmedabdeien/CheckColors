import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [form, setForm] = useState({ name: '', email: '', password: '', referralCode: refCode });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.referralCode);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">C</div>
            <span className="text-2xl font-bold text-white">CheckColors</span>
          </div>
          <p className="text-slate-400">ابدأ مجاناً الآن 🎨</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">إنشاء حساب جديد</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">الاسم</label>
              <div className="relative">
                <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="اسمك الكامل" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="example@email.com" dir="ltr" />
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="6 أحرف على الأقل" dir="ltr" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm mb-1.5 flex items-center gap-1.5"><FiGift className="text-yellow-400" /> كود الإحالة (اختياري)</label>
              <input type="text" value={form.referralCode} onChange={e => setForm(p => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition uppercase tracking-widest"
                placeholder="XXXXXXXX" maxLength={8} dir="ltr" />
              {refCode && <p className="text-yellow-400 text-xs mt-1">✓ تم تطبيق كود الإحالة</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition disabled:opacity-60">
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب مجاناً'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
