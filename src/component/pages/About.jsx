import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaRocket, FaUsers, FaMedal, FaLightbulb, FaHandshakeSimple, FaPalette } from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

export default function About() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const stats = [
    { number: '50K+', label: t('about.stat1') },
    { number: '1M+',  label: t('about.stat2') },
    { number: '98%',  label: t('about.stat3') },
    { number: '150+', label: t('about.stat4') },
  ];

  const values = [
    { icon: FaMedal,           title: t('about.val1Title'), text: t('about.val1Text') },
    { icon: FaUsers,           title: t('about.val2Title'), text: t('about.val2Text') },
    { icon: FaLightbulb,       title: t('about.val3Title'), text: t('about.val3Text') },
    { icon: FaHandshakeSimple, title: t('about.val4Title'), text: t('about.val4Text') },
  ];

  const team = [
    { name: t('about.team1Name'), role: t('about.team1Role'), bio: t('about.team1Bio') },
    { name: t('about.team2Name'), role: t('about.team2Role'), bio: t('about.team2Bio') },
    { name: t('about.team3Name'), role: t('about.team3Role'), bio: t('about.team3Bio') },
  ];

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Hero */}
      <section className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>{t('about.badge')}</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LI_TEXT }}>
              {t('about.headline')}
            </h1>
            <p className="text-base mb-6" style={{ color: LI_MUTED }}>{t('about.subtext')}</p>
            <Link to="/register"
              className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: LI_BLUE }}>
              {t('about.getStarted')}
            </Link>
          </div>
          <div className="flex-shrink-0">
            <div className="w-40 h-40 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EEF3F8' }}>
              <FaPalette style={{ fontSize: 72, color: LI_BLUE }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: LI_BLUE }}>{s.number}</div>
              <div className="text-sm" style={{ color: LI_MUTED }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8" style={{ border: `1px solid ${LI_BORDER}` }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#EEF3F8' }}>
              <FaRocket style={{ color: LI_BLUE }} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: LI_TEXT }}>{t('about.missionTitle')}</h2>
          </div>
          <p className="text-sm mb-3" style={{ color: LI_MUTED }}>{t('about.mission1')}</p>
          <p className="text-sm" style={{ color: LI_MUTED }}>{t('about.mission2')}</p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold mb-6" style={{ color: LI_TEXT }}>{t('about.valuesTitle')}</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white rounded-xl p-6 text-center"
              style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: '#EEF3F8' }}>
                <Icon style={{ color: LI_BLUE }} />
              </div>
              <h3 className="font-semibold mb-1 text-sm" style={{ color: LI_TEXT }}>{title}</h3>
              <p className="text-xs" style={{ color: LI_MUTED }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold mb-6" style={{ color: LI_TEXT }}>{t('about.teamTitle')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {team.map(m => (
            <div key={m.name} className="bg-white rounded-xl p-6 flex items-start gap-4"
              style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0A66C2, #5BA4CF)' }}>
                {m.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: LI_TEXT }}>{m.name}</p>
                <p className="text-xs mb-1" style={{ color: LI_BLUE }}>{m.role}</p>
                <p className="text-xs" style={{ color: LI_MUTED }}>{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
