import { Link } from 'react-router-dom';
import { FaXTwitter, FaGithub, FaLinkedin } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';
import CheckColorslogo from '../assets/cc-logo.svg';

const LI_BLUE = '#0A66C2';
const LI_BORDER = '#E0DFDC';
const LI_MUTED = '#00000099';
const LI_TEXT = '#000000E6';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const links = {
    [t('footer.product')]: [
      { to: '/explore',            label: t('nav.explore') },
      { to: '/Contrast-Checker',   label: t('nav.contrast') },
      { to: '/gradient-generator', label: t('nav.gradient') },
      { to: '/tints-shades',       label: t('nav.tints') },
      { to: '/image-to-palette',   label: t('nav.imageToPalette') },
      { to: '/Ai-Colors',          label: t('nav.ai') },
    ],
    [t('footer.company')]: [
      { to: '/About',   label: t('nav.about') },
      { to: '/Contact', label: t('nav.contact') },
      { to: '/pricing', label: t('nav.pricing') },
    ],
    [t('footer.account')]: [
      { to: '/login',     label: t('auth.signin') },
      { to: '/register',  label: t('auth.join') },
      { to: '/dashboard', label: t('nav.dashboard') },
    ],
  };

  return (
    <footer className="bg-white border-t" style={{ borderColor: LI_BORDER }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <img src={CheckColorslogo} alt="CheckColors" className="w-8 h-8" />
              <span className="font-bold text-base" style={{ color: LI_BLUE }}>CheckColors</span>
            </Link>
            <p className="text-xs leading-relaxed mb-4" style={{ color: LI_MUTED }}>
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3">
              {[FaXTwitter, FaGithub, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#F3F2EF', color: LI_MUTED }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EEF3F8'; e.currentTarget.style.color = LI_BLUE; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F3F2EF'; e.currentTarget.style.color = LI_MUTED; }}>
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: LI_TEXT }}>{heading}</h3>
              <ul className="space-y-2">
                {items.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-xs transition-colors"
                      style={{ color: LI_MUTED }}
                      onMouseEnter={e => e.currentTarget.style.color = LI_BLUE}
                      onMouseLeave={e => e.currentTarget.style.color = LI_MUTED}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderColor: LI_BORDER }}>
          <p className="text-xs" style={{ color: LI_MUTED }}>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            {[t('footer.privacy'), t('footer.terms'), t('footer.cookies')].map(txt => (
              <a key={txt} href="#" className="text-xs" style={{ color: LI_MUTED }}
                onMouseEnter={e => e.currentTarget.style.color = LI_BLUE}
                onMouseLeave={e => e.currentTarget.style.color = LI_MUTED}>{txt}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
