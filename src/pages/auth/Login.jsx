import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPalette, FaArrowRight } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'بيانات غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaPalette className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-black mb-4">CheckColors</h1>
          <p className="text-blue-100 text-lg">أداتك الاحترافية لإنشاء وإدارة الباليتات اللونية بالذكاء الاصطناعي</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['+5K', 'باليت محفوظ'], ['100%', 'مجاني للبدء'], ['AI', 'ذكاء اصطناعي']].map(([v, l]) => (
              <div key={l} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-black">{v}</div>
                <div className="text-blue-100 text-xs mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FaPalette className="text-white text-xl" />
            </div>
            <span className="text-2xl font-black text-gray-800">CheckColors</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-1">مرحباً بعودتك</h2>
            <p className="text-gray-500 text-sm mb-7">سجل دخولك للمتابعة</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" dir="rtl">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
                <div className="relative">
                  <FaEnvelope className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="email" {...register('email')} dir="ltr"
                    className={`w-full border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="example@email.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">كلمة المرور</label>
                <div className="relative">
                  <FaLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type={showPass ? 'text' : 'password'} {...register('password')} dir="ltr"
                    className={`w-full border rounded-xl pr-10 pl-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><span>دخول</span><FaArrowRight className="text-sm" /></>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              ليس لديك حساب؟{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">إنشاء حساب مجاني</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
