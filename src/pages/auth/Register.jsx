import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGift, FaCheck } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import CheckColorslogo from '../../assets/Check-Colors.png';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
});

const LI_BLUE = '#0A66C2';
const LI_BORDER = '#E0DFDC';

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
      toast.error(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    'Save up to 10 palettes for free',
    '5 AI generations per month',
    'Contrast checker & color tools',
    'Extract colors from images',
  ];

  const Field = ({ name, label, type = 'text', icon: Icon, placeholder, extra }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#00000066' }} />}
        <input
          type={type} {...register(name)} placeholder={placeholder}
          className="w-full py-2.5 rounded-md text-sm outline-none"
          style={{
            border: `1px solid ${errors[name] ? '#CC1016' : '#B0B0B0'}`,
            paddingLeft: Icon ? '2.25rem' : '0.75rem',
            paddingRight: extra ? '2.5rem' : '0.75rem',
            color: '#000000E6',
          }}
          onFocus={e => !errors[name] && (e.target.style.borderColor = LI_BLUE)}
          onBlur={e => !errors[name] && (e.target.style.borderColor = '#B0B0B0')}
        />
        {extra}
      </div>
      {errors[name] && <p className="text-xs mt-1" style={{ color: '#CC1016' }}>{errors[name].message}</p>}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#F3F2EF', minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-8 items-start">

        {/* Left: perks (hidden on mobile) */}
        <div className="hidden lg:block flex-1 pt-12">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src={CheckColorslogo} alt="CheckColors" className="w-10 h-10" />
            <span className="text-xl font-bold" style={{ color: LI_BLUE }}>CheckColors</span>
          </Link>
          <h2 className="text-2xl font-bold leading-snug mb-6" style={{ color: '#000000E6' }}>
            The professional color tool for modern designers
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
        </div>

        {/* Right: form */}
        <div className="flex-1 max-w-md w-full">
          <div className="text-center mb-5 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={CheckColorslogo} alt="CheckColors" className="w-8 h-8" />
              <span className="text-lg font-bold" style={{ color: LI_BLUE }}>CheckColors</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8" style={{ border: `1px solid ${LI_BORDER}` }}>
            <h1 className="text-xl font-bold mb-1" style={{ color: '#000000E6' }}>Make the most of your professional life</h1>
            <p className="text-sm mb-5" style={{ color: '#00000099' }}>Free forever. No credit card required.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field name="name" label="Full name" icon={FaUser} placeholder="Your full name" />
              <Field name="email" label="Email" type="email" icon={FaEnvelope} placeholder="Email" />
              <Field
                name="password" label="Password (6+ characters)"
                type={showPass ? 'text' : 'password'} icon={FaLock} placeholder="Password"
                extra={
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#00000066' }}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                }
              />

              {/* Referral */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#000000E6' }}>
                  <FaGift style={{ color: '#915907' }} /> Referral code <span style={{ color: '#00000066', fontWeight: 400 }}>(optional)</span>
                </label>
                <input type="text" {...register('referralCode')} placeholder="XXXXXXXX" maxLength={8}
                  className="w-full px-3 py-2.5 rounded-md text-sm outline-none uppercase tracking-widest"
                  style={{ border: `1px solid ${LI_BORDER}`, color: '#000000E6' }}
                  onFocus={e => e.target.style.borderColor = '#915907'}
                  onBlur={e => e.target.style.borderColor = LI_BORDER}
                />
                {refCode && (
                  <p className="flex items-center gap-1 text-xs mt-1" style={{ color: '#057642' }}>
                    <FaCheck className="text-[10px]" /> Referral code applied
                  </p>
                )}
              </div>

              <p className="text-xs leading-relaxed" style={{ color: '#00000066' }}>
                By clicking Agree & Join, you agree to CheckColors'{' '}
                <a href="#" style={{ color: LI_BLUE }}>User Agreement</a>,{' '}
                <a href="#" style={{ color: LI_BLUE }}>Privacy Policy</a>, and{' '}
                <a href="#" style={{ color: LI_BLUE }}>Cookie Policy</a>.
              </p>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-full text-white font-semibold text-sm disabled:opacity-60"
                style={{ backgroundColor: LI_BLUE }}
                onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#004182')}
                onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = LI_BLUE)}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Agree & Join'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: LI_BORDER }} />
              <span className="text-xs" style={{ color: '#00000066' }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: LI_BORDER }} />
            </div>

            <p className="text-center text-sm" style={{ color: '#000000E6' }}>
              Already on CheckColors?{' '}
              <Link to="/login" className="font-semibold" style={{ color: LI_BLUE }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
