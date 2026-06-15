import { Link } from 'react-router-dom';
import { FaHouse, FaPalette } from 'react-icons/fa6';
import { useTranslation } from 'react-i18next';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}
      className="flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: '#EEF3F8' }}>
          <FaPalette style={{ fontSize: 36, color: LI_BLUE }} />
        </div>

        <h1 className="text-8xl font-bold mb-4" style={{ color: LI_BLUE }}>404</h1>
        <h2 className="text-2xl font-bold mb-3" style={{ color: LI_TEXT }}>{t('notFound.title')}</h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: LI_MUTED }}>{t('notFound.desc')}</p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: LI_BLUE }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
            <FaHouse className="text-xs" /> {t('notFound.goHome')}
          </Link>
          <Link to="/Color-Palettes"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: LI_BLUE, color: LI_BLUE }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EEF3F8'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            {t('notFound.explore')}
          </Link>
        </div>
      </div>
    </div>
  );
}
