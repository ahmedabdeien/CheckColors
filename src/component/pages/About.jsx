import { FaRocket, FaUsers, FaMedal, FaLightbulb, FaHandshakeSimple, FaPalette } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const stats = [
  { number: '50K+', label: 'Monthly Users' },
  { number: '1M+', label: 'Palettes Created' },
  { number: '98%', label: 'Satisfaction Rate' },
  { number: '150+', label: 'Countries Served' },
];

const values = [
  { icon: FaMedal, title: 'Excellence', text: 'We pursue perfection in every palette' },
  { icon: FaUsers, title: 'Community', text: 'Building tools for everyone' },
  { icon: FaLightbulb, title: 'Innovation', text: 'Constantly evolving our platform' },
  { icon: FaHandshakeSimple, title: 'Integrity', text: 'Honest and transparent practices' },
];

const team = [
  { name: 'Alex Chen', role: 'Founder & CEO', bio: 'Color theory enthusiast with 10+ years in design' },
  { name: 'Maria Gomez', role: 'Lead Developer', bio: 'Full-stack wizard passionate about UI/UX' },
  { name: 'Samir Patel', role: 'Design Director', bio: 'Award-winning visual designer' },
];

export default function About() {
  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>

      {/* Hero */}
      <section className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>About Us</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: LI_TEXT }}>
              Empowering designers with beautiful color palettes
            </h1>
            <p className="text-base mb-6" style={{ color: LI_MUTED }}>
              Since 2023, CheckColors has been the go-to platform for designers and developers
              who need professional color tools built for the modern web.
            </p>
            <Link to="/register"
              className="inline-block px-6 py-2.5 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: LI_BLUE }}>
              Get Started Free
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
            <h2 className="text-xl font-bold" style={{ color: LI_TEXT }}>Our Mission</h2>
          </div>
          <p className="text-sm mb-3" style={{ color: LI_MUTED }}>
            To simplify color selection and palette creation for digital projects. We believe
            that the right color combinations can transform designs and elevate user experiences.
          </p>
          <p className="text-sm" style={{ color: LI_MUTED }}>
            Our platform bridges the gap between inspiration and implementation, providing
            tools that help both beginners and professionals create stunning color schemes.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold mb-6" style={{ color: LI_TEXT }}>Our Core Values</h2>
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
        <h2 className="text-xl font-bold mb-6" style={{ color: LI_TEXT }}>Meet the Team</h2>
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
