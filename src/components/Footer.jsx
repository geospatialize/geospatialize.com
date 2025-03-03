import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { navItems } from './NavItems';

/**
 * Footer Component
 * 
 * A responsive footer that displays contact information, location details, 
 * navigation links, and a live-updating timestamp.
 * 
 * Features interactive location text that changes on hover/click and
 * adapts its layout based on viewport size.
 * 
 * @param {function} onSectionChange - Callback to trigger section content changes
 */
function Footer({ onSectionChange }) {
  // =========================================
  // State Management
  // =========================================
  
  /**
   * Main state variables:
   * - currentTime: Tracks current time for live clock display
   * - isMobile: Determines if mobile layout should be used
   * - hovered: Tracks mouse hover state for location text
   * - clicked: Tracks click state for location text
   */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // =========================================
  // Constants
  // =========================================
  
  /**
   * Text content for location information
   * - shortMessage: Brief location description (default view)
   * - longMessage: Detailed location with Indigenous territories (shown on hover/click)
   */
  const shortMessage = 'Based in the Lower Mainland, British Columbia, Canada';
  const longMessage =
    'In and around the traditional, ancestral, and unceded territories of the xʷməθkʷəy̓əm (Musqueam),\n' +
    'Sḵwx̱wú7mesh (Squamish), Səl̓ílwətaʔ/Selilwitulh (Tsleil-Waututh), kʷikʷəƛ̓əm (kwikwetlem), Stó:lō, and Kwantlen Nations';

  // =========================================
  // Effects
  // =========================================
  
  /**
   * Live clock effect
   * Updates current time every second for the footer clock display
   */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Responsive layout effect
   * Detects viewport size changes to toggle between mobile and desktop layouts
   */
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // =========================================
  // Helper Functions
  // =========================================
  
  /**
   * Formats the current time for display
   * Shows time with hour, minute, second and timezone
   * 
   * @param {Date} date - Date object to format
   * @returns {string} - Formatted time string
   */
  const formatTime = (date) =>
    date.toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    });

  /**
   * Handles navigation between different sections
   * Controls scroll behavior and content changes
   * 
   * @param {string} label - The navigation item label
   */
  const handleNavigation = (label) => {
    const contentSection = document.getElementById('content-section');
    const heroSection = document.getElementById('hero-section');
    switch (label.toLowerCase()) {
      case 'home':
        if (heroSection) heroSection.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'about':
        onSectionChange('about');
        setTimeout(() => {
          contentSection?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      case 'work':
        onSectionChange('latest');
        setTimeout(() => {
          contentSection?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;
      default:
        break;
    }
  };

  // =========================================
  // UI Components
  // =========================================
  
  /**
   * Connect + Contact section
   * Displays social media and contact links with icons
   */
  const connectContactBlock = (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-1">Connect + Contact</h3>
      <div className="flex justify-center space-x-4">
        <a
          href="https://github.com/geospatialize"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent-hover"
        >
          <Github className="w-8 h-8 hover:scale-110 transition-transform" />
        </a>
        <a
          href="https://www.linkedin.com/in/geospatialize/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-accent-hover"
        >
          <Linkedin className="w-8 h-8 hover:scale-110 transition-transform" />
        </a>
        <a
          href="mailto:Geospatialize@protonmail.com"
          className="transition-colors hover:text-accent"
        >
          <Mail className="w-8 h-8 hover:scale-110 transition-transform" />
        </a>
      </div>
    </div>
  );

  /**
   * Location information section
   * Features interactive text that changes on hover/click
   * Uses CSS transitions for smooth animation between states
   */
  const locationBlock = (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-0">Location</h3>
      <div
        className="relative cursor-pointer min-h-[2.5rem]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setClicked((prev) => !prev)}
      >
        {/* Short message (default view) */}
        <p
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            hovered || clicked ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          } text-base`}
        >
          {shortMessage}
        </p>
        {/* Long message (shown on hover/click) */}
        <p
          className={`absolute inset-0 flex items-center justify-center whitespace-pre-line transition-all duration-300 text-accent text-sm ${
            hovered || clicked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          } line-clamp-2`}
        >
          {longMessage}
        </p>
      </div>
    </div>
  );

  /**
   * Navigation links section
   * Displays main navigation items (excluding Contact)
   */
  const navigationRow = (
    <div className="mt-4 flex justify-center space-x-4">
      {navItems
        .filter((item) => item.label.toLowerCase() !== 'contact')
        .map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.label)}
            className="text-lg uppercase tracking-wider font-bold transition-colors hover:text-accent"
          >
            {item.label}
          </button>
        ))}
    </div>
  );

  // =========================================
  // Main Render
  // =========================================
  return (
    <footer className="bg-background text-text select-none">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Conditional rendering based on viewport size */}
        {isMobile ? (
          <>
            {/* Mobile layout: stacked without location block */}
            {connectContactBlock}
            {navigationRow}
          </>
        ) : (
          <>
            {/* Desktop layout: includes location information */}
            <div className="space-y-4">
              {connectContactBlock}
              {locationBlock}
            </div>
            {navigationRow}
          </>
        )}
        {/* Copyright and time display (always shown) */}
        <div className="text-center text-xs text-text-muted mt-2">
          <p>
            © {currentTime.getFullYear()} Dave Choi | Personal Website | All rights reserved.
          </p>
          <p className="mt-0.5 mb-1">{formatTime(currentTime)}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;