import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaPalette, FaWandMagicSparkles, FaArrowRight,
  FaCircleHalfStroke, FaImage, FaShuffle, FaStar,
  FaPlay, FaBolt, FaUsers, FaFill, FaDroplet, FaSwatchbook
} from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const palettes = [
  { name: 'Ocean Blue',    colors: ['#0A66C2', '#1E88E5', '#42A5F5', '#90CAF9', '#BBDEFB'] },
  { name: 'Forest Green',  colors: ['#057642', '#00A36C', '#2ECC71', '#A8D5BA', '#D4EDDA'] },
  { name: 'Sunset Red',    colors: ['#CC1016', '#E53935', '#EF5350', '#FFCDD2', '#FCE4EC'] },
  { name: 'Golden Hour',   colors: ['#915907', '#F57C00', '#FFA726', '#FFE0B2', '#FFF3E0'] },
];

const stats = [
  { value: '50K+', label: 'Color Palettes' },
  { value: '12K+', label: 'Active Designers' },
  { value: '200+', label: 'AI Generations Daily' },
  { value: '99%',  label: 'Satisfaction Rate' },
];

const features = [
  { icon: FaPalette,           title: 'Color Palettes',     desc: 'Browse thousands of curated color palettes for every design need.', link: '/Color-Palettes' },
  { icon: FaCircleHalfStroke,  title: 'Contrast Checker',   desc: 'Ensure WCAG accessibility compliance with real-time contrast analysis.', link: '/Contrast-Checker' },
  { icon: FaWandMagicSparkles, title: 'AI Color Generator', desc: 'Generate perfect palettes instantly using artificial intelligence.', link: '/Ai-Colors' },
  { icon: FaImage,             title: 'Image to Palette',   desc: 'Extract beautiful color schemes from any image in seconds.', link: '/image-to-palette' },
  { icon: FaShuffle,           title: 'Palette Generator',  desc: 'Create harmonious color combinations with one click.', link: '/Generate-Palette' },
  { icon: FaSwatchbook,        title: 'Color Library',      desc: 'Explore 200+ named colors with HEX, RGB, and HSL values.', link: '/colors' },
  { icon: FaFill,              title: 'Gradient Generator', desc: 'Create stunning CSS gradients with live preview and instant export.', link: '/gradient-generator' },
  { icon: FaDroplet,           title: 'Tints & Shades',     desc: 'Generate the perfect tints and shades scale from any base color.', link: '/tints-shades' },
];

export default function Home() {
  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>

      {/* Hero */}
      <section className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-5"
              style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>
              <FaBolt className="text-[10px]" /> Professional Color Tools
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5" style={{ color: LI_TEXT }}>
              Create Beautiful<br />
              <span style={{ color: LI_BLUE }}>Color Palettes</span><br />
              with AI
            </h1>
            <p className="text-base md:text-lg mb-8 leading-relaxed max-w-lg" style={{ color: LI_MUTED }}>
              Discover, create, and share stunning color combinations for your next design project. Powered by AI, built for professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/register"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-sm"
                style={{ backgroundColor: LI_BLUE }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
                Get started free <FaArrowRight />
              </Link>
              <Link to="/Color-Palettes"
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm border"
                style={{ borderColor: LI_BLUE, color: LI_BLUE }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EEF3F8'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <FaPlay className="text-xs" /> Explore palettes
              </Link>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="w-full max-w-xs lg:max-w-sm">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1px solid ${LI_BORDER}` }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: LI_BORDER }}>
                <p className="text-sm font-semibold" style={{ color: LI_TEXT }}>Trending Today</p>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>Live</span>
              </div>
              {palettes.map(({ name, colors }) => (
                <div key={name} className="px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderColor: '#F3F2EF' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: LI_TEXT }}>{name}</p>
                  <div className="flex gap-1 mb-1.5">
                    {colors.map(c => (
                      <div key={c} className="flex-1 h-7 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {colors.slice(0, 3).map(c => (
                      <span key={c} className="text-[9px] font-mono" style={{ color: LI_MUTED }}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: LI_BLUE }}>{value}</div>
              <div className="text-sm" style={{ color: LI_MUTED }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: LI_TEXT }}>Everything you need for color</h2>
            <p className="text-sm" style={{ color: LI_MUTED }}>Professional tools designed for designers and developers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, link }) => (
              <Link key={title} to={link}
                className="bg-white rounded-xl p-6 block hover:shadow-md transition-all group"
                style={{ border: `1px solid ${LI_BORDER}` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#EEF3F8' }}>
                  <Icon className="text-lg group-hover:scale-110 transition-transform" style={{ color: LI_BLUE }} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5 group-hover:text-blue-700 transition-colors" style={{ color: LI_TEXT }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: LI_MUTED }}>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / CTA */}
      <section className="py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-10 text-center" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <FaStar key={i} style={{ color: '#F5C518' }} />)}
            </div>
            <div className="flex -space-x-2 justify-center mb-5">
              {['#0A66C2', '#057642', '#CC1016', '#915907', '#5B4FE8'].map((bg, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: bg }}>
                  {['A', 'B', 'C', 'D', 'E'][i]}
                </div>
              ))}
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: LI_TEXT }}>
              Join 12,000+ designers using CheckColors
            </h2>
            <p className="text-sm mb-6" style={{ color: LI_MUTED }}>
              Start for free. No credit card required. Upgrade anytime.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full text-white font-semibold text-sm"
              style={{ backgroundColor: LI_BLUE }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
              <FaUsers /> Create free account
            </Link>
            <p className="text-xs mt-3" style={{ color: LI_MUTED }}>Already have an account? <Link to="/login" style={{ color: LI_BLUE }} className="font-semibold">Sign in</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}
