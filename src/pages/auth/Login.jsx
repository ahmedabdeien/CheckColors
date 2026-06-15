import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import CheckColorslogo from '../../assets/cc-logo.svg';

const LI_BLUE = '#0A66C2';
const LI_BORDER = '#E0DFDC';

export default function Login() {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    email: z.string().email(t('auth.emailError', 'Please enter a valid email')),
    password: z.string().min(6, t('auth.passwordError', 'Password must be at least 6 characters')),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidCredentials', 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F3F2EF', minHeight: '100vh' }}
      className="flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={CheckColorslogo} alt="CheckColors" className="w-10 h-10" />
            <span className="text-xl font-bold" style={{ color: LI_BLUE }}>CheckColors</span>
          </Link>
          <p className="mt-3 text-lg font-semibold" style={{ color: '#000000E6' }}>
            {t('auth.signIn')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: `1px solid ${LI_BORDER}` }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>
                {t('auth.email')}
              </label>
              <div className="relative">
                <FaEnvelope className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-sm`}
                  style={{ color: '#00000066' }} />
                <input
                  type="email" {...register('email')}
                  className="w-full py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${errors.email ? '#CC1016' : '#B0B0B0'}`,
                    color: '#000000E6',
                    paddingLeft: isRTL ? '0.75rem' : '2.25rem',
                    paddingRight: isRTL ? '2.25rem' : '0.75rem',
                  }}
                  onFocus={e => !errors.email && (e.target.style.borderColor = LI_BLUE)}
                  onBlur={e => !errors.email && (e.target.style.borderColor = '#B0B0B0')}
                  placeholder={t('auth.emailPlaceholder', 'Email')}
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: '#CC1016' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: '#000000E6' }}>{t('auth.password')}</label>
                <a href="#" className="text-xs font-semibold" style={{ color: LI_BLUE }}>{t('auth.forgotPassword')}</a>
              </div>
              <div className="relative">
                <FaLock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-sm`}
                  style={{ color: '#00000066' }} />
                <input
                  type={showPass ? 'text' : 'password'} {...register('password')}
                  className="w-full py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    border: `1px solid ${errors.password ? '#CC1016' : '#B0B0B0'}`,
                    color: '#000000E6',
                    paddingLeft: isRTL ? '2.5rem' : '2.25rem',
                    paddingRight: isRTL ? '2.25rem' : '2.5rem',
                  }}
                  onFocus={e => !errors.password && (e.target.style.borderColor = LI_BLUE)}
                  onBlur={e => !errors.password && (e.target.style.borderColor = '#B0B0B0')}
                  placeholder={t('auth.passwordPlaceholder', 'Password')}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}
                  style={{ color: '#00000066' }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#CC1016' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-full text-white font-semibold text-sm transition-all disabled:opacity-60"
              style={{ backgroundColor: LI_BLUE }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#004182')}
              onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = LI_BLUE)}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('auth.signingIn')}
                </span>
              ) : t('nav.signIn')}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: LI_BORDER }} />
            <span className="text-xs" style={{ color: '#00000066' }}>{t('auth.or', 'أو')}</span>
            <div className="flex-1 h-px" style={{ backgroundColor: LI_BORDER }} />
          </div>

          <p className="text-center text-sm" style={{ color: '#000000E6' }}>
            {t('auth.newTo')}{' '}
            <Link to="/register" className="font-semibold" style={{ color: LI_BLUE }}>
              {t('auth.joinNow')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
