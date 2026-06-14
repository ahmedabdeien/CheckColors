import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPalette, FaGift, FaArrowRight, FaCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'الاسم حرفان على الأقل'),
  email: z.string().email('بريد إلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور 6 أحرف على الأقل'),
  referralCode: z.string().optional(),
});

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: refCode },
  });

  const onSubmit = async ({ name, email, password, referralCode }) => {
    setLoading(true);
    try {
      await registerUser(name, email, password, referralCode);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const features = ['حفظ 10 باليتات مجاناً', '5 توليدات AI شهرياً', 'فحص التباين', 'استخراج ألوان من الصور'];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <FaPalette className="text-4xl" />
          </div>
          <h1 className="text-4xl font-black mb-3">ابدأ مجاناً</h1>
          <p className="text-purple-100 text-lg mb-8">انضم لآلاف المصممين الذين يستخدمون CheckColors</p>
          <ul className="space-y-3">
            {features.map(f => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FaCheck className="text-xs" />
                </div>
                <span className="text-purple-100">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FaPalette className="text-white text-xl" />
            </div>
            <span className="text-2xl font-black text-gray-800">CheckColors</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-1">إنشاء حساب جديد</h2>
            <p className="text-gray-500 text-sm mb-7">مجاني 100% — لا يلزم بطاقة بنكية</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">الاسم</label>
                <div className="relative">
                  <FaUser className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="text" {...register('name')}
                    className={`w-full border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="اسمك الكامل" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
                <div className="relative">
                  <FaEnvelope className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="email" {...register('email')} dir="ltr"
                    className={`w-full border rounded-xl pr-10 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="example@email.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 block">كلمة المرور</label>
                <div className="relative">
                  <FaLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type={showPass ? 'text' : 'password'} {...register('password')} dir="ltr"
                    className={`w-full border rounded-xl pr-10 pl-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                    placeholder="6 أحرف على الأقل" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="text-gray-700 text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <FaGift className="text-yellow-500" /> كود الإحالة <span className="text-gray-400 font-normal">(اختياري)</span>
                </label>
                <input type="text" {...register('referralCode')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50 uppercase tracking-widest transition"
                  placeholder="XXXXXXXX" maxLength={8} dir="ltr" />
                {refCode && <p className="text-green-600 text-xs mt-1 flex items-center gap-1"><FaCheck /> تم تطبيق كود الإحالة</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><span>إنشاء الحساب مجاناً</span><FaArrowRight className="text-sm" /></>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              لديك حساب؟{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">تسجيل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
