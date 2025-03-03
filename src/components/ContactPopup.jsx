import React from 'react';

function ContactPopup({ isVisible, isLocked }) {
  // Only render if visible or locked
  if (!isVisible && !isLocked) return null;

  const isMobile = window.innerWidth < 768;

  return (
    <div
      className={`
        absolute
        top-full
        z-50
        font-mono
        bg-code-background
        border border-code-border
        rounded-lg
        shadow-lg
        ${
          // For mobile: full width, auto height
          isMobile
            ? 'inset-x-0 mt-0 w-full p-0 h-auto'
            : // For non-mobile: right side of page, fixed width
              'right-0 mt-0 w-[460px] p-4'
        }
      `}
    >
      <div className={`text-code-text ${isMobile ? 'text-sm p-4' : 'text-lg'}`}>
        <span className="text-code-pink">if</span>
        <span> (</span>
        <span className="text-code-blue">needToContact</span>
        <span>) {'{'}</span>
        
        <div className="ml-6">
          <span className="text-code-green">// Preferred contact methods</span>
          <div>
            <span className="text-code-blue">contactVia</span>
            <span> = {'{'}</span>
          </div>

          {/* Preferred Contacts */}
          <div className="ml-6 flex flex-col gap-3">
            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-base'}`}>
              <span className="text-code-teal">linkedIn</span>
              <span>:</span>
              <a
                href="https://www.linkedin.com/in/geospatialize/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-code-orange transition-colors hover:text-code-green"
              >
                "/in/geospatialize"
              </a>
              <span>,</span>
            </div>
            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-base'}`}>
              <span className="text-code-teal">email</span>
              <span>:</span>
              <a
                href="mailto:Geospatialize@protonmail.com"
                className="text-code-orange transition-colors hover:text-code-green"
              >
                "Geospatialize@protonmail.com"
              </a>
            </div>
          </div>
          <div>{'}'}</div>
        </div>

        <div>{'}'}</div>

        <div>
          <span className="text-code-pink">else</span>
          <span> {'{'}</span>
        </div>

        {/*Message*/}
        <div className="ml-6">
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-code-green`}>
            // Have you tried turning it off and on again? 🤔
          </span>
        </div>

        <div>{'}'}</div>
      </div>
    </div>
  );
}

export default ContactPopup;
