import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { navItems } from './NavItems';
import GlobeIcon from './GlobeIcon';
import ContactPopup from './ContactPopup';

/**
 * Navbar Component
 * 
 * A responsive navigation bar that adapts between desktop and mobile layouts.
 * Features a contact popup functionality and automatic mobile menu closing.
 * 
 * @param {boolean} onIntersection - Intersection status of the navbar
 * @param {function} onSectionChange - Callback to trigger section content changes
 * @param {function} onContactVisibility - Callback to update contact popup visibility status
 */
function Navbar({ onIntersection, onSectionChange, onContactVisibility }) {
  // =========================================
  // State Management
  // =========================================
  
  /**
   * Main state variables:
   * - isMenuOpen: Controls mobile menu visibility
   * - showContactPopup: Controls the visibility of contact information
   * - isPopupLocked: Keeps the contact popup open after clicking
   * - isMobile: Tracks if viewport is in mobile size
   */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [isPopupLocked, setIsPopupLocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // =========================================
  // Refs
  // =========================================
  
  /**
   * - navRef: Reference to the navigation element for event handling
   * - idleTimerRef: Reference to track the auto-close timer
   */
  const navRef = useRef(null);
  const idleTimerRef = useRef(null);

  // =========================================
  // Effects
  // =========================================
  
  /**
   * Check for mobile viewport on mount and resize
   * Updates isMobile state based on window width
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Update parent component when contact visibility changes
   * This allows other components to react to popup state
   */
  useEffect(() => {
    onContactVisibility(showContactPopup || isPopupLocked);
  }, [showContactPopup, isPopupLocked, onContactVisibility]);

  /**
   * Handle clicks outside the popup
   * Closes the popup when clicking elsewhere in the document
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isPopupLocked || (isMobile && showContactPopup)) {
        const isClickingContactButton = event.target.closest('[data-contact-button]');
        const isClickingPopup = event.target.closest('[data-contact-popup]');
        if (!isClickingContactButton && !isClickingPopup) {
          setIsPopupLocked(false);
          setShowContactPopup(false);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isPopupLocked, isMobile, showContactPopup]);

  /**
   * Menu idle timer management
   * Automatically closes menu after period of inactivity
   */
  useEffect(() => {
    if (isMenuOpen) {
      // Only start the idle timer if the popup is NOT active
      if (!showContactPopup && !isPopupLocked) {
        startIdleTimer();
      }
    } else {
      stopIdleTimer();
    }
    // Cleanup if the component re-renders
    return () => stopIdleTimer();
  }, [isMenuOpen, showContactPopup, isPopupLocked]);

  /**
   * Popup state effect on idle timer
   * Controls idle timer based on popup state changes
   */
  useEffect(() => {
    if (showContactPopup || isPopupLocked) {
      // Don't auto-close the menu if the popup is open
      stopIdleTimer();
    } else if (isMenuOpen) {
      // Popup closed, menu is still open: resume the timer
      startIdleTimer();
    }
  }, [showContactPopup, isPopupLocked, isMenuOpen]);

  // =========================================
  // Helper Functions
  // =========================================
  
  /**
   * Starts or restarts the idle timer to auto-close menu
   * Timer is set to 7 seconds of inactivity
   */
  const startIdleTimer = () => {
    stopIdleTimer(); // clear any previous timer
    idleTimerRef.current = setTimeout(() => {
      // If the popup isn't open, close the menu
      if (!showContactPopup && !isPopupLocked) {
        setIsMenuOpen(false);
      }
    }, 7000);
  };

  /**
   * Stops the idle timer and cleans up the timeout
   */
  const stopIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  /**
   * Handles mouse hover events for the contact button
   * Only applies in desktop mode
   * 
   * @param {boolean} isHovering - Whether mouse is hovering over the contact button
   */
  const handleContactHover = (isHovering) => {
    if (!isPopupLocked && !isMobile) {
      setShowContactPopup(isHovering);
    }
  };

  /**
   * Handles click events on the contact button
   * Behavior differs between mobile and desktop
   * 
   * @param {Event} e - The click event
   */
  const handleContactClick = (e) => {
    e.preventDefault();
    if (isMobile) {
      setShowContactPopup(!showContactPopup);
    } else {
      if (isPopupLocked) {
        setIsPopupLocked(false);
        setShowContactPopup(false);
      } else {
        setIsPopupLocked(true);
        setShowContactPopup(true);
      }
    }
  };

  /**
   * Handles navigation between different sections
   * Triggers scroll and content changes
   * 
   * @param {string} label - The navigation item label
   */
  const handleNavigation = (label) => {
    const contentSection = document.getElementById('content-section');
    const heroSection = document.getElementById('hero-section');
    switch (label.toLowerCase()) {
      case 'home':
        heroSection?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'about':
        onSectionChange('about');
        setTimeout(() => contentSection?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      case 'work':
        onSectionChange('latest');
        setTimeout(() => contentSection?.scrollIntoView({ behavior: 'smooth' }), 100);
        break;
      default:
        break;
    }
  };

  /**
   * Resets the idle timer when user interacts with the nav
   * Prevents menu from closing while user is actively using it
   */
  const handleNavClick = () => {
    if (isMenuOpen && !showContactPopup && !isPopupLocked) {
      startIdleTimer();
    }
  };

  // =========================================
  // UI Components
  // =========================================
  
  /**
   * Renders desktop navigation items
   * Includes hover effects for contact popup
   */
  const renderDesktopNavItems = () => (
    <div className="hidden md:flex space-x-8">
      {navItems.map((item) => (
        <div
          key={item.id}
          className="relative flex items-center"
          onMouseEnter={() => item.label === 'Contact' && handleContactHover(true)}
          onMouseLeave={() => item.label === 'Contact' && handleContactHover(false)}
        >
          <button
            data-contact-button={item.label === 'Contact' ? 'true' : undefined}
            onClick={(e) => {
              if (item.label === 'Contact') {
                handleContactClick(e);
              } else {
                handleNavigation(item.label);
              }
            }}
            className={`hover:text-accent transition-colors font-bold text-lg ${
              item.label === 'Contact' && (showContactPopup || isPopupLocked)
                ? 'text-accent'
                : ''
            }`}
          >
            {item.label}
          </button>
          {/* Contact popup (desktop absolute) */}
          {item.label === 'Contact' && (
            <div data-contact-popup="true" className="absolute top-full left-0 mt-2">
              <ContactPopup isVisible={showContactPopup} isLocked={isPopupLocked} />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  /**
   * Renders mobile navigation items
   * Includes compact layout with borders between items
   */
  const renderMobileNavItems = () => (
    <div
      className={`
        md:hidden 
        transition-all
        duration-300
        ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        ${showContactPopup || isPopupLocked ? 'overflow-visible' : 'overflow-hidden'}
      `}
    >
      <div className="px-0 py-0">
        {navItems.map((item, index) => (
          <div 
            key={item.id} 
            className={`relative ${
              index < navItems.length - 1 ? 'border-b border-gray-600 pb-0 mb-0.5' : ''
            }`}
          >
            <button
              data-contact-button={item.label === 'Contact' ? 'true' : undefined}
              onClick={(e) => {
                if (item.label === 'Contact') {
                  handleContactClick(e);
                } else {
                  handleNavigation(item.label);
                  // If navigating away from Contact, also close the menu
                  setIsMenuOpen(false);
                }
              }}
              className={`block w-full text-left pl-4 py-0 hover:text-accent font-bold text-lg ${
                item.label === 'Contact' && showContactPopup ? 'text-accent' : ''
              }`}
            >
              {item.label}
            </button>
            {/* Contact popup (mobile in-flow) */}
            {item.label === 'Contact' && (
              <div data-contact-popup="true" className="mt-2">
                <ContactPopup
                  isVisible={showContactPopup}
                  isLocked={isPopupLocked}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // =========================================
  // Main Render
  // =========================================
  return (
    <nav
      ref={navRef}
      onClick={handleNavClick}
      className="bg-primary text-white sticky top-0 z-50 transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand / Logo */}
          <div className="flex items-center">
            <div className="group flex items-center gap-3 cursor-pointer">
              <GlobeIcon />
              <span className="text-xl font-bold">
                Geospatialize <span className="text-accent">|</span> Dave Choi
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          {renderDesktopNavItems()}
          
          {/* Mobile menu toggle button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-accent"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {renderMobileNavItems()}
      </div>
    </nav>
  );
}

export default Navbar;