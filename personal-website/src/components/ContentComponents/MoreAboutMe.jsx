// ContentComponents/MoreAboutMe.jsx
import React from 'react';

export const MoreAboutMe = () => {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4">Professional Journey</h2>
      <div className="space-y-4">
        <p className="content-paragraph text-min-sm md:text-min-base lg:text-min-lg">
          My journey began with studying Urban Forestry at UBC, where I developed a 
          strong foundation in environmental science and urban planning. This led me 
          to discover GIS technology and its powerful applications in environmental management.
        </p>
        <p className="content-paragraph text-min-sm md:text-min-base lg:text-min-lg">
          After completing my studies at BCIT's Advanced Diploma in GIS program, 
          I've been working on various projects that combine my environmental background 
          with cutting-edge spatial technology.
        </p>
      </div>
    </div>
  );
};

export default MoreAboutMe;