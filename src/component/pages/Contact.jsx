import { useState } from 'react';
import { FaEnvelope, FaPhone, FaLocationDot, FaPaperPlane, FaClock, FaCircleCheck } from 'react-icons/fa6';

const LI_BLUE = '#0A66C2';
const LI_BG = '#F3F2EF';
const LI_BORDER = '#E0DFDC';
const LI_TEXT = '#000000E6';
const LI_MUTED = '#00000099';

const contactInfo = [
  {
    icon: FaEnvelope,
    title: 'Email',
    lines: ['support@checkcolors.com', 'sales@checkcolors.com'],
  },
  {
    icon: FaPhone,
    title: 'Phone',
    lines: ['+1 (555) 123-4567', 'Mon-Fri: 9am - 5pm PST'],
  },
  {
    icon: FaLocationDot,
    title: 'Office',
    lines: ['123 Color Street', 'San Francisco, CA 94107'],
  },
];

const hours = [
  'Monday - Friday: 9am - 6pm PST',
  'Saturday: 10am - 4pm PST',
  'Sunday: Closed',
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const inputStyle = {
    border: `1px solid ${LI_BORDER}`,
    borderRadius: 6,
    padding: '10px 12px',
    fontSize: 14,
    color: LI_TEXT,
    width: '100%',
    outline: 'none',
    background: '#fff',
  };

  const handleFocus = e => e.target.style.borderColor = LI_BLUE;
  const handleBlur = e => e.target.style.borderColor = LI_BORDER;

  return (
    <div style={{ backgroundColor: LI_BG, minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: LI_BORDER }}>
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3"
            style={{ backgroundColor: '#EEF3F8', color: LI_BLUE }}>Contact</span>
          <h1 className="text-3xl font-bold mb-2" style={{ color: LI_TEXT }}>Get in Touch</h1>
          <p className="text-sm" style={{ color: LI_MUTED }}>
            Have questions or need support? We're here to help!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6">

        {/* Form */}
        <div className="bg-white rounded-xl p-8" style={{ border: `1px solid ${LI_BORDER}` }}>
          <h2 className="text-lg font-bold mb-6" style={{ color: LI_TEXT }}>Send us a message</h2>

          {isSubmitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#F0FFF6' }}>
                <FaCircleCheck style={{ fontSize: 28, color: '#057642' }} />
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: LI_TEXT }}>Message Sent!</h3>
              <p className="text-sm" style={{ color: LI_MUTED }}>We'll get back to you within 24 hours.</p>
              <button onClick={() => setIsSubmitted(false)}
                className="mt-5 px-5 py-2 text-sm font-semibold rounded-full"
                style={{ backgroundColor: LI_BLUE, color: '#fff' }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: 'name', label: 'Full Name', type: 'text' },
                { id: 'email', label: 'Email', type: 'email' },
                { id: 'subject', label: 'Subject', type: 'text' },
              ].map(({ id, label, type }) => (
                <div key={id}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: LI_TEXT }}>{label}</label>
                  <input type={type} required style={inputStyle}
                    value={formData[id]}
                    onChange={e => setFormData({ ...formData, [id]: e.target.value })}
                    onFocus={handleFocus} onBlur={handleBlur} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: LI_TEXT }}>Message</label>
                <textarea rows={4} required style={inputStyle}
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  onFocus={handleFocus} onBlur={handleBlur} />
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: LI_BLUE }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#004182'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = LI_BLUE}>
                <FaPaperPlane className="text-xs" /> Send Message
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6" style={{ border: `1px solid ${LI_BORDER}` }}>
            <h2 className="text-base font-bold mb-5" style={{ color: LI_TEXT }}>Contact Information</h2>
            <div className="space-y-5">
              {contactInfo.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#EEF3F8' }}>
                    <Icon style={{ color: LI_BLUE, fontSize: 14 }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: LI_TEXT }}>{title}</p>
                    {lines.map(l => <p key={l} className="text-xs" style={{ color: LI_MUTED }}>{l}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6" style={{ border: `1px solid ${LI_BORDER}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#EEF3F8' }}>
                <FaClock style={{ color: LI_BLUE, fontSize: 14 }} />
              </div>
              <h2 className="text-base font-bold" style={{ color: LI_TEXT }}>Working Hours</h2>
            </div>
            <div className="space-y-2">
              {hours.map(h => (
                <p key={h} className="text-xs" style={{ color: LI_MUTED }}>{h}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
