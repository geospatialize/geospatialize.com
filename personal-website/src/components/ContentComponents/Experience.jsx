// ContentComponents/Experience.jsx
import React from 'react';

export const Experience = () => {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold mb-4">Professional Experience</h2>
      <div className="space-y-6">
        <div className="experience-item">
          <h3 className="text-xl font-semibold">GIS Professional</h3>
          <p className="text-gray-400">2023 - Present</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Developing web-based GIS applications using React and ArcGIS API</li>
            <li>Conducting spatial analysis for environmental planning projects</li>
            <li>Creating automated workflows using Python and FME</li>
          </ul>
        </div>
        <div className="experience-item">
          <h3 className="text-xl font-semibold">GIS Technical Assistant</h3>
          <p className="text-gray-400">2022 - 2023</p>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            <li>Assisted in database management and spatial data processing</li>
            <li>Created maps and conducted spatial analysis using ArcGIS Pro</li>
            <li>Supported field data collection and validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Experience;
