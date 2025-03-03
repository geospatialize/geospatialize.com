import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Content from './components/Content';
import Footer from './components/Footer';

export default function App() {
  const [isContentInView, setIsContentInView] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [isContactVisible, setIsContactVisible] = useState(false);

  useEffect(() => {
    const contentSection = document.querySelector('#content-section');
    const heroSection = document.querySelector('#hero-section');

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsContentInView(entry.isIntersecting);
      },
      { threshold: 0.8 }
    );

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setIsHeroInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (contentSection) {
      observer.observe(contentSection);
    }

    if (heroSection) {
      heroObserver.observe(heroSection);
    }

    return () => {
      if (contentSection) observer.unobserve(contentSection);
      if (heroSection) heroObserver.unobserve(heroSection);
    };
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleContactVisibility = (isVisible) => {
    setIsContactVisible(isVisible);
  };

  return (
    <>
      <style>{`
        /* Hide scrollbar for WebKit browsers */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge, and Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="min-h-screen bg-[#222222] flex flex-col overflow-x-hidden">
        <div
          className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-700 ${
            isContentInView && !isContactVisible ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <Navbar
            onIntersection={isContentInView}
            onSectionChange={handleSectionChange}
            onContactVisibility={handleContactVisibility}
          />
        </div>

        <div className="h-screen overflow-y-auto snap-y snap-proximity overflow-x-hidden scroll-smooth hide-scrollbar">
          <section id="hero-section" className="w-full h-screen snap-start">
            <HeroSection />
          </section>

          <section id="content-section" className="w-full h-screen snap-center">
            <Content initialLayer={activeSection} onLayerChange={handleSectionChange} />
          </section>

          <footer id="footer-section" className="w-full snap-start">
            <Footer onSectionChange={handleSectionChange} />
          </footer>
        </div>
      </div>
    </>
  );
}
