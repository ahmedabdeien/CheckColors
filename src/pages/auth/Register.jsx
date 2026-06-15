import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGift, FaCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import CheckColorslogo from '../../assets/cc-logo.svg';

const LI_BLUE = '#0A66C2';
const LI_BORDER = '#E0DFDC';

export default function Register() {
  const { register: registerUser } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    name: z.string().min(2, t('auth.nameError', 'Name must be at least 2 characters')),
    email: z.string().email(t('auth.emailError', 'Please enter a valid email')),
    password: z.string().min(6, t('auth.passwordError', 'Password must be at least 6 characters')),
    referralCode: z.string().optional(),
  });

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
      toast.error(err.response?.data?.message || t('auth.registerError', 'Error creating account'));
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    t('auth.perk1', 'Save up to 10 palettes for free'),
    t('auth.perk2', '5 AI generations per month'),
    t('auth.perk3', 'Contrast checker & color tools'),
    t('auth.perk4', 'Extract colors from images'),
  ];

  const inputStyle = (fieldName) => ({
    border: `1px solid ${errors[fieldName] ? '#CC1016' : '#B0B0B0'}`,
    color: '#000000E6',
    borderRadius: '0.75rem',
  });

  return (
    <div style={{ backgroundColor: '#F3F2EF', minHeight: '100vh' }}
      className="flex items-center justify-center p-4"
      dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-4xl flex gap-8 items-start">

        {/* Left perks — hidden on mobile */}
        <div className="hidden lg:block flex-1 pt-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src={CheckColorslogo} alt="CheckColors" className="w-10 h-10" />
            <span className="text-xl font-bold" style={{ color: LI_BLUE }}>CheckColors</span>
          </Link>
          <h2 className="text-2xl font-bold leading-snug mb-6" style={{ color: '#000000E6' }}>
            {t('auth.createAccount')}
          </h2>
          <ul className="space-y-3">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm" style={{ color: '#000000CC' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#EEF3F8' }}>
                  <FaCheck className="text-[8px]" style={{ color: LI_BLUE }} />
                </div>
                {p}
              </li>
            ))}
          </ul>

          {/* Palette preview */}
          <div className="mt-8 rounded-2xl overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="flex" style={{ height: 48 }}>
              {['#0A66C2','#5BA4CF','#057642','#F59E0B','#CC1016'].map(c => (
                <div key={c} style={{ flex: 1, backgroundColor: c }} />
              ))}
            </div>
            <div className="bg-white px-4 py-2">
              <p className="text-xs font-semibold" style={{ color: '#000000E6' }}>CheckColors Signature</p>
              <p className="text-[10px]" style={{ color: '#00000066' }}>5 colors · Professional</p>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 max-w-md w-full">
          <div className="text-center mb-5 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={CheckColorslogo} alt="CheckColors" className="w-8 h-8" />
              <span className="text-lg font-bold" style={{ color: LI_BLUE }}>CheckColors</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: `1px solid ${LI_BORDER}` }}>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#000000E6' }}>
              {t('auth.createAccount')}
            </h1>
            <p className="text-sm mb-5" style={{ color: '#00000099' }}>{t('auth.freeForever')}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>{t('auth.fullName')}</label>
                <div className="relative">
                  <FaUser className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-sm`} style={{ color: '#00000066' }} />
                  <input type="text" {...register('name')} placeholder={t('auth.fullName')}
                    className="w-full py-2.5 text-sm outline-none transition-all"
                    style={{ ...inputStyle('name'), paddingLeft: isRTL ? '0.75rem' : '2.25rem', paddingRight: isRTL ? '2.25rem' : '0.75rem' }}
                    onFocus={e => !errors.name && (e.target.style.borderColor = LI_BLUE)}
                    onBlur={e => !errors.name && (e.target.style.borderColor = '#B0B0B0')} />
                </div>
                {errors.name && <p className="text-xs mt-1" style={{ color: '#CC1016' }}>{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>{t('auth.email')}</label>
                <div className="relative">
                  <FaEnvelope className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-sm`} style={{ color: '#00000066' }} />
                  <input type="email" {...register('email')} placeholder="Email"
                    className="w-full py-2.5 text-sm outline-none transition-all"
                    style={{ ...inputStyle('email'), paddingLeft: isRTL ? '0.75rem' : '2.25rem', paddingRight: isRTL ? '2.25rem' : '0.75rem' }}
                    onFocus={e => !errors.email && (e.target.style.borderColor = LI_BLUE)}
                    onBlur={e => !errors.email && (e.target.style.borderColor = '#B0B0B0')} />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: '#CC1016' }}>{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>{t('auth.passwordHint')}</label>
                <div className="relative">
                  <FaLock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-sm`} style={{ color: '#00000066' }} />
                  <input type={showPass ? 'text' : 'password'} {...register('password')} placeholder={t('auth.password')}
                    className="w-full py-2.5 text-sm outline-none transition-all"
                    style={{ ...inputStyle('password'), paddingLeft: isRTL ? '2.5rem' : '2.25rem', paddingRight: isRTL ? '2.25rem' : '2.5rem' }}
                    onFocus={e => !errors.password && (e.target.style.borderColor = LI_BLUE)}
                    onBlur={e => !errors.password && (e.target.style.borderColor = '#B0B0B0')} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-sm`}
                    style={{ color: '#00000066' }}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: '#CC1016' }}>{errors.password.message}</p>}
              </div>

              {/* Referral */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>
                  <FaGift style={{ color: '#915907' }} />
                  {t('auth.referralCode')} <span style={{ color: '#00000066', fontWeight: 400 }}>{t('auth.optional')}</span>
                </label>
                <input type="text" {...register('referralCode')} placeholder="XXXXXXXX" maxLength={8}
                  className="w-full px-3 py-2.5 text-sm outline-none uppercase tracking-widest"
                  style={{ border: `1px solid ${LI_BORDER}`, color: '#000000E6', borderRadius: '0.75rem' }}
                  onFocus={e => e.target.style.borderColor = '#915907'}
                  onBlur={e => e.target.style.borderColor = LI_BORDER} />
                {refCode && (
                  <p className="flex items-center gap-1 text-xs mt-1" style={{ color: '#057642' }}>
                    <FaCheck className="text-[10px]" /> {t('auth.referralApplied', 'Referral code applied')}
                  </p>
                )}
              </div>

              <p className="text-xs leading-relaxed" style={{ color: '#00000066' }}>
                {t('auth.agreeText')}{' '}
                <a href="#" style={{ color: LI_BLUE }}>{t('auth.userAgreement')}</a>,{' '}
                <a href="#" style={{ color: LI_BLUE }}>{t('auth.privacyPolicy')}</a>{' '}
                {t('auth.and', 'و')}{' '}
                <a href="#" style={{ color: LI_BLUE }}>{t('auth.cookiePolicy')}</a>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-full text-white font-semibold text-sm disabled:opacity-60 transition-all"
                style={{ backgroundColor: LI_BLUE }}
                onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#004182')}
                onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = LI_BLUE)}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('auth.creatingAccount')}
                  </span>
                ) : t('auth.agree')}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: LI_BORDER }} />
              <span className="text-xs" style={{ color: '#00000066' }}>{t('auth.or', 'أو')}</span>
              <div className="flex-1 h-px" style={{ backgroundColor: LI_BORDER }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#000000E6' }}>
              {t('auth.alreadyMember')}{' '}
              <Link to="/login" className="font-semibold" style={{ color: LI_BLUE }}>{t('nav.signIn')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
