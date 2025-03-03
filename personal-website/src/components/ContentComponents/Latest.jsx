// ContentComponents/Latest.jsx
import React, { useEffect, useState, useLayoutEffect } from 'react';

export const Latest = () => {
  const [animationStage, setAnimationStage] = useState(0); 
  // Stages: 0=initial, 1=titles visible, 2=dates typing, 3=dates complete, 4=descriptions visible, 5=all content static
  const [typingProgress, setTypingProgress] = useState(0); // 0-100 represents percentage of completion
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Handle responsive sizing
  useLayoutEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Project data
  const projects = [
    {
      title: "Updating FME Custom Transformer for AWS Bedrock AI integrations.",
      date: "Completed in March 2025",
      description: "I volunteered to update the AWSBedrockConnector on FME to support newer generative AI models available on Amazon Bedrock. While the original custom transformer used the user's selected model ID and TestFilter to stream the desired Generative AI model to the model-specific syntax for requests pathway, I incorporated a robust method to invoke the inference profile on AWS for available Model IDs and implemented a feature joiner based on the AI Model ID selected by the user to stream to the model-specific request pathway."
    },
    {
      title: "Technical Support Internship at Safe Software Inc.",
      date: "Completed in May 2024",
      description: "I was selected for a practicum opportunity to create resources on using FME for typical applications related to ArcGIS Utility Network tasks. This includes reading and writing ArcGIS Feature services and file geodatabases, retrieving updated, inserted, and deleted features between different versions of datasets and updating, inserting, and deleting features to a dataset, generating HTML reports for ArcGIS Utility Networks, and synchronizing ArcGIS Utility Network data. If you want to check out my work on this project,<a href='https://support.safe.com/hc/en-us/articles/27709010535821-FME-Esri-ArcGIS-Utility-Network-Tutorial-Series' target='_blank' rel='noopener noreferrer' class='text-green-500'> check out the tutorial article!</a>"
    },
    {
      title: "Esri Canada Centres of Excellence – App Challenge Competition Participant (BCITree).",
      // Notice this date includes HTML with an <a> tag
      date: "Completed in April 2024, <a href='https://esricanada-ce.github.io/appchallenge/2024/' target='_blank' rel='noopener noreferrer' class='text-green-500'> Winning Team</a>",
      description: "While attending BCIT for Advanced Diploma in GIS, Jason Ellis, Logan Salayka-Ladouceur, and I participated as team BCITree to visualize tree equity in Vancouver, British Columbia. Inspired by Cecil C. Konijnendijk's 3-30-300 rules for Urban Forestry, which advocates for 3 visible trees from every home, 30% tree canopy cover in the neighborhood, and 300 meters from the nearest public park, we created an equal-part index at the local area boundary scale (neighborhood scale) and dissemination scale. For more information about this project, check out <a href='https://github.com/EsriCanada-CE/ecce-app-challenge-2024/tree/main/BCITree' target='_blank' rel='noopener noreferrer' class='text-green-500'>ECCE's App Challenge entry on Github</a>."
    }
  ];
  
  // Animation sequence with cleanup for timers
  useEffect(() => {
    const timeoutIds = [];
    const intervalIds = [];
    
    // Start the sequence
    const t1 = setTimeout(() => {
      setAnimationStage(1); // Titles visible
      
      const t2 = setTimeout(() => {
        setAnimationStage(2); // Dates typing
        
        const typingDuration = 2000; // time to type in ms
        const intervalTime = 30; // update frequency in ms
        const steps = typingDuration / intervalTime;
        let currentStep = 0;
        
        const typingInterval = setInterval(() => {
          currentStep++;
          const progress = Math.min((currentStep / steps) * 100, 100);
          setTypingProgress(progress);
          
          if (progress >= 100) {
            clearInterval(typingInterval);
            setAnimationStage(3); // Dates complete
            
            const t3 = setTimeout(() => {
              setAnimationStage(4); // Descriptions visible
              
              const t4 = setTimeout(() => {
                setAnimationStage(5); // All content static
              }, 1200);
              timeoutIds.push(t4);
            }, 400);
            timeoutIds.push(t3);
          }
        }, intervalTime);
        intervalIds.push(typingInterval);
      }, 600);
      timeoutIds.push(t2);
    }, 400);
    timeoutIds.push(t1);
    
    // Cleanup
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      intervalIds.forEach(id => clearInterval(id));
    };
  }, []);
  
  // Returns typed text based on current progress (for plain text)
  const getTypedText = (text) => {
    if (animationStage < 2) return '';
    if (animationStage >= 3) return text; // fully typed
    
    const charsToShow = Math.floor((typingProgress / 100) * text.length);
    return text.substring(0, charsToShow);
  };

  // Returns either the typed plain text (stages 2 -> partial) or full HTML (stage >= 3)
  const getDateContent = (date) => {
    if (animationStage < 2) {
      // Not typing yet
      return '';
    } else if (animationStage < 3) {
      // Typing in progress: strip out any HTML tags to avoid showing raw <a>
      const stripped = date.replace(/<[^>]+>/g, '');
      return getTypedText(stripped);
    } else {
      // Typing done (stage >= 3): show full HTML with link
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: date.replace(/<a /g, '<a class="text-green-500" '),
          }}
        />
      );
    }
  };

  // Define styles dynamically (no media queries in inline styles)
  const projectItemStyle = {
    marginBottom: 0,
    paddingBottom: 0
  };

  const titleStyle = {
    fontSize: windowWidth < 768 ? '1.125rem' : '1.25rem',
    fontWeight: 600,
    marginBottom: 0,
    paddingBottom: 0,
    opacity: animationStage >= 1 ? 1 : 0,
    transition: 'opacity 0.6s ease-in-out'
  };

  const dateContainerStyle = {
    color: '#9ca3af',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: 1.2,
    height: windowWidth < 768 ? '1.3rem' : '1.5rem',
    fontSize: windowWidth < 768 ? '0.75rem' : '0.875rem'
  };

  const dateTextStyle = {
    margin: 0,
    padding: 0
  };

  const descriptionStyle = {
    maxWidth: windowWidth >= 1024 ? '70rem' : windowWidth >= 768 ? '36rem' : '100%',
    marginTop: '0.25rem',
    marginBottom: animationStage >= 4 ? '2rem' : '0',
    maxHeight: animationStage >= 4 ? '1000px' : '0',
    overflow: 'hidden',
    opacity: animationStage >= 4 ? 1 : 0,
    transform: animationStage >= 4 ? 'scaleY(1)' : 'scaleY(0)',
    transformOrigin: 'top',
    transition: 'opacity 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), transform 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), margin-bottom 1.2s cubic-bezier(0.25, 0.1, 0.25, 1), max-height 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
    fontSize: windowWidth < 768 ? '0.875rem' : '1rem'
  };

  return (
    <div className="py-4">
      <div>
        {projects.map((project, index) => (
          <div key={index} style={projectItemStyle}>
            {/* Title and date */}
            <div>
              <h3 style={titleStyle}>
                {project.title}
              </h3>
              <div style={dateContainerStyle}>
                {/* Use getDateContent to show typed text or full HTML */}
                <p style={dateTextStyle}>
                  {getDateContent(project.date)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div 
              style={descriptionStyle}
              dangerouslySetInnerHTML={{ 
                __html: project.description.replace(/<a /g, '<a class="text-green-500" ') 
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Latest;
