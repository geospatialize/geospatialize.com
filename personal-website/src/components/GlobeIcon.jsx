import React, { useState, useEffect } from 'react';

function GlobeIcon() {
  const [isFocused, setIsFocused] = useState(true);

  // Handle focus and blur to pause/resume animation without resetting
  useEffect(() => {
    function handleWindowFocus() {
      setIsFocused(true);
    }
    function handleWindowBlur() {
      setIsFocused(false);
    }

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return (
    <div className="w-12 h-12 flex items-center justify-center">
      <svg
        className="animate-globe-spin w-full h-full"
        style={{ animationPlayState: isFocused ? "running" : "paused" }}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 
          Clipping path to ensure lines and continents 
          do not extend past the circle boundary
        */}
        <defs>
          <clipPath id="circleClip">
            <circle cx="32" cy="32" r="30.5" />
          </clipPath>
        </defs>

        {/* Outer Circle */}
        <circle
          cx="32"
          cy="32"
          r="30.5"
          stroke="#CCC"
          strokeWidth="2"
          fill="#90CDF4"
        />

        {/* Group all lines and continents so they don't extend past the circle */}
        <g clipPath="url(#circleClip)">
          {/* Latitude Lines */}
          <path d="M6 12C12 14 52 14 58 12" stroke="#2F855A" strokeWidth="4" />
          <path d="M6 22C12 24 52 24 58 22" stroke="#2F855A" strokeWidth="4" />
          <path d="M6 32C12 34 52 34 58 32" stroke="#2F855A" strokeWidth="4" />
          <path d="M6 42C12 44 52 44 58 42" stroke="#2F855A" strokeWidth="4" />
          <path d="M6 52C12 54 52 54 58 52" stroke="#2F855A" strokeWidth="4" />

          {/* Longitude Lines */}
          <path d="M32 2V62" stroke="#2F855A" strokeWidth="4" />
          <path d="M44 58C50 44 50 20 44 6" stroke="#2F855A" strokeWidth="4" />
          <path d="M20 58C14 44 14 20 20 6" stroke="#2F855A" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

export default GlobeIcon;
