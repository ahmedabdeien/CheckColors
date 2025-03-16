import React from 'react'

import { LuRocket, LuUsers, LuMedal, LuLightbulb, LuHeartHandshake } from "react-icons/lu";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 to-blue-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About Our Color Platform</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Empowering designers and developers with beautiful color palettes since 2023
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                To simplify color selection and palette creation for digital projects. We believe
                that the right color combinations can transform designs and elevate user experiences.
              </p>
              <p className="text-gray-600">
                Our platform bridges the gap between inspiration and implementation, providing
                tools that help both beginners and professionals create stunning color schemes.
              </p>
            </div>
            <div className="space-y-4">
              <LuRocket className="w-24 h-24 text-purple-600 mx-auto" />
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">10,000+ Colors Generated</h3>
                <p className="text-gray-600">And counting every day</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Alex Chen', role: 'Founder & CEO', bio: 'Color theory enthusiast with 10+ years in design' },
              { name: 'Maria Gomez', role: 'Lead Developer', bio: 'Full-stack wizard passionate about UI/UX' },
              { name: 'Samir Patel', role: 'Design Director', bio: 'Award-winning visual designer' },
            ].map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <img 
                  src={`https://placehold.co/400x400/eee/ccc?text=${member.name.split(' ')[0]}`}
                  alt={member.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-purple-600 mb-2">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <LuMedal />, title: 'Excellence', text: 'We pursue perfection in every palette' },
              { icon: <LuUsers />, title: 'Community', text: 'Building tools for everyone' },
              { icon: <LuLightbulb />, title: 'Innovation', text: 'Constantly evolving our platform' },
              { icon: <LuHeartHandshake />, title: 'Integrity', text: 'Honest and transparent practices' },
            ].map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center hover:shadow-lg transition-all">
                <div className="text-4xl text-purple-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '50K+', label: 'Monthly Users' },
              { number: '1M+', label: 'Palettes Created' },
              { number: '98%', label: 'Satisfaction Rate' },
              { number: '150+', label: 'Countries Served' },
            ].map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      
    </div>
  );
};

export default About;