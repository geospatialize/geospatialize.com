import React, { useState, useEffect, useRef } from 'react';

// Import content components
import { About } from './ContentComponents/About';
import { MoreAboutMe } from './ContentComponents/MoreAboutMe';
import { Experience } from './ContentComponents/Experience';
import { Latest } from './ContentComponents/Latest';
import { InterestingVisuals } from './ContentComponents/InterestingVisuals';

// ===== CONSTANTS =====
// Default state for togglable categories in the catalog
const INITIAL_CATEGORIES = {
  education: false,
  technicalSkills: false,
  softSkills: false,
  programmingLanguages: false,
  languages: false,
  availability: false,
};

// Clone initial categories for default state
const DEFAULT_TOGGLED_STATE = { ...INITIAL_CATEGORIES };

// Navigation items for the sidebar
const NAV_ITEMS = [
  { id: 'about', label: 'About Me', indented: false },
  { id: 'more-about-me', label: 'More About Me', indented: true },
  { id: 'experience', label: 'Experience', indented: false },
  { id: 'latest', label: 'Latest', indented: false },
  { id: 'interesting-visuals', label: 'Interesting visuals', indented: true },
];

/**
 * Helper function to split an array into two columns
 * @param {Array} items - Array to split into columns
 * @returns {Array} Array containing two arrays (columns)
 */
const splitIntoColumns = (items) => {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
};

/**
 * Main Content component that handles the layout and navigation
 * @param {Object} props - Component props
 * @param {string} props.initialLayer - Initial active layer/page
 * @param {Function} props.onLayerChange - Callback when layer changes
 */
export default function Content({ initialLayer = 'about', onLayerChange }) {
  // ===== STATE MANAGEMENT =====
  // Active content layer/page
  const [activeLayer, setActiveLayer] = useState(initialLayer);
  // Controls visibility of the catalog sidebar
  const [catalogOpen, setCatalogOpen] = useState(false);
  // Tracks which categories are expanded in the catalog
  const [toggledCategories, setToggledCategories] = useState(DEFAULT_TOGGLED_STATE);
  // Indicates if the catalog header should be sticky
  const [isSticky, setIsSticky] = useState(false);
  // Width of the catalog when open (responsive)
  const [catalogWidth, setCatalogWidth] = useState('0px');
  // Flag for tracking education font size initialization
  const [fontSizesInitialized, setFontSizesInitialized] = useState(false);
  // Stores calculated font sizes for education items
  const [educationFontSizes, setEducationFontSizes] = useState({ institution: null, degree: null });
  // Flag for small viewport detection
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  // ===== REFS =====
  const contentRef = useRef(null);
  const catalogRef = useRef(null);
  const catalogHeaderRef = useRef(null);

  // ===== EFFECTS =====
  // Add custom CSS to hide scrollbars while keeping content scrollable
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .hide-scrollbar::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(styleEl);
    
    // Cleanup function
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Update active layer when initialLayer prop changes
  useEffect(() => {
    setActiveLayer(initialLayer);
  }, [initialLayer]);

  // Handle sticky header in catalog when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (catalogRef.current) {
        const catalogItems = catalogRef.current.querySelector('.catalog-items');
        if (catalogItems) {
          setIsSticky(catalogItems.scrollTop > 0);
        }
      }
    };
    
    const catalogItems = catalogRef.current?.querySelector('.catalog-items');
    if (catalogItems) {
      catalogItems.addEventListener('scroll', handleScroll);
      return () => catalogItems.removeEventListener('scroll', handleScroll);
    }
  }, [catalogOpen]);

  // Check for content overflow in catalog
  useEffect(() => {
    if (catalogOpen && catalogRef.current) {
      const checkHeight = () => {
        const container = catalogRef.current;
        if (container.scrollHeight > container.clientHeight) {
          console.log('Content overflow detected in Catalog');
        }
      };
      
      checkHeight();
      window.addEventListener('resize', checkHeight);
      return () => window.removeEventListener('resize', checkHeight);
    }
  }, [catalogOpen]);

  // Adjust content area height
  useEffect(() => {
    const updateContentHeight = () => {
      if (contentRef.current) {
        const containerHeight = contentRef.current.clientHeight;
        const contentArea = contentRef.current.querySelector('.content-text');
        if (contentArea) {
          contentArea.style.maxHeight = `${containerHeight - 100}px`;
        }
      }
    };
    
    updateContentHeight();
    window.addEventListener('resize', updateContentHeight);
    return () => window.removeEventListener('resize', updateContentHeight);
  }, [activeLayer, catalogOpen]);

  // Adjust catalog width based on viewport size
  useEffect(() => {
    const updateCatalogWidth = () => {
      if (catalogOpen) {
        if (window.innerWidth >= 1536) { // 2xl
          setCatalogWidth('430px');
        } else if (window.innerWidth >= 1024) { // lg
          setCatalogWidth('370px');
        } else if (window.innerWidth >= 768) { // md
          setCatalogWidth('40%');
        } else {
          setCatalogWidth('100%');
        }
      } else {
        setCatalogWidth('0px');
      }
      setIsSmallViewport(window.innerWidth < 768);
    };
    
    updateCatalogWidth();
    window.addEventListener('resize', updateCatalogWidth);
    return () => window.removeEventListener('resize', updateCatalogWidth);
  }, [catalogOpen]);

  // ===== HELPER FUNCTIONS =====
  /**
   * Calculate and apply fixed font sizes for education items
   * Ensures consistent and readable text across different viewport sizes
   */
  const calculateEducationFontSizes = () => {
    const educationInstitutions = document.querySelectorAll('.education-institution');
    const degreeItems = document.querySelectorAll('.education-degree');
    if (!educationInstitutions.length) return;

    // Reset all font sizes for accurate measurement
    educationInstitutions.forEach(item => {
      item.style.fontSize = '';
    });
    degreeItems.forEach(item => {
      item.style.fontSize = '';
    });

    const viewportWidth = window.innerWidth;
    const useMediumViewportAdjustment = viewportWidth >= 500 && viewportWidth < 1024;
    let minRatio = 1;
    
    // Calculate minimum ratio needed for text to fit in container
    educationInstitutions.forEach(item => {
      let containerWidth;
      if (item.parentElement) {
        const catalogItem = item.closest('.catalog-item');
        if (catalogItem) {
          containerWidth = catalogItem.clientWidth - 60;
        } else {
          containerWidth = item.parentElement.clientWidth - 30;
        }
      } else {
        containerWidth = 120;
      }
      const textWidth = item.scrollWidth;
      if (textWidth > containerWidth) {
        const ratio = containerWidth / textWidth;
        minRatio = Math.min(minRatio, ratio);
      }
    });

    // Determine font sizes based on viewport and ratio
    let institutionSize, degreeSize;
    minRatio = Math.min(minRatio, 0.8);

    if (useMediumViewportAdjustment) {
      institutionSize = 11;
      degreeSize = 9;
    } else if (minRatio < 1) {
      const baseFontSize = parseFloat(window.getComputedStyle(educationInstitutions[0]).fontSize);
      institutionSize = Math.max(baseFontSize * minRatio * 0.75, 9);
    } else {
      if (window.innerWidth >= 1024) {
        institutionSize = 12;
      } else if (window.innerWidth >= 768) {
        institutionSize = 11;
      } else {
        institutionSize = 9;
      }
    }
    degreeSize = Math.max(institutionSize * 0.8, 8);

    // Update state with calculated sizes
    setEducationFontSizes({
      institution: institutionSize,
      degree: degreeSize
    });
    console.log("Calculated education font sizes:", institutionSize, degreeSize, "for viewport width:", viewportWidth);
    
    // Apply new sizes to DOM elements
    educationInstitutions.forEach(item => {
      item.style.fontSize = `${institutionSize}px`;
    });
    degreeItems.forEach(item => {
      item.style.fontSize = `${degreeSize}px`;
    });
  };

  /**
   * Adjust font sizes for language items to fit containers
   */
  const adjustLanguageItems = () => {
    const languageItems = document.querySelectorAll('.language-item');
    
    languageItems.forEach(item => {
      const languageSpan = item.querySelector('span:first-child');
      const levelSpan = item.querySelector('span:last-child');
      
      if (languageSpan && levelSpan) {
        // Reset font sizes for accurate measurement
        languageSpan.style.fontSize = '';
        levelSpan.style.fontSize = '';
        
        let containerWidth = item.clientWidth;
        const languageWidth = languageSpan.scrollWidth;
        
        if (languageWidth > containerWidth) {
          const ratio = containerWidth / languageWidth;
          const baseFontSize = parseFloat(window.getComputedStyle(languageSpan).fontSize);
          
          // Calculate new font sizes
          let newLanguageFontSize = window.innerWidth < 380
            ? Math.max(baseFontSize * ratio * 0.7, 10)
            : Math.max(baseFontSize * ratio * 0.95, 12);
          
          languageSpan.style.fontSize = `${newLanguageFontSize}px`;
          
          const newLevelFontSize = Math.max(newLanguageFontSize * 0.85, 8);
          levelSpan.style.fontSize = `${newLevelFontSize}px`;
        } else {
          // Only adjust level font size for better hierarchy
          const baseFontSize = parseFloat(window.getComputedStyle(languageSpan).fontSize);
          levelSpan.style.fontSize = `${baseFontSize * 0.85}px`;
        }
      }
    });
  };

  // ===== EVENT HANDLERS =====
  /**
   * Toggle expansion of a category in the catalog
   * @param {string} categoryId - ID of the category to toggle
   */
  const handleToggle = (categoryId) => {
    setToggledCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  /**
   * Toggle visibility of the catalog sidebar
   */
  const handleCatalogToggle = () => {
    setCatalogOpen(!catalogOpen);
  };

  /**
   * Change the active content layer/page
   * @param {string} layer - ID of the layer to activate
   */
  const handleLayerChange = (layer) => {
    setActiveLayer(layer);
    if (onLayerChange) {
      onLayerChange(layer);
    }
  };

  // ===== SUB-COMPONENTS =====
  /**
   * Component for displaying single-line text with responsive font sizes
   */
  function SingleLineText({ children, className = '', style = {}, ...rest }) {
    return (
      <>
        {/* For larger screens - full text */}
        <span 
          className={`hidden lg:inline ${className} select-none`}
          style={{ 
            whiteSpace: 'nowrap',
            fontSize: '14px', 
            ...style 
          }} 
          {...rest}
        >
          {children}
        </span>
        
        {/* For medium screens - slightly smaller */}
        <span 
          className={`hidden md:inline lg:hidden ${className} select-none`}
          style={{ 
            whiteSpace: 'nowrap',
            fontSize: '13px', 
            ...style 
          }} 
          {...rest}
        >
          {children}
        </span>
        
        {/* For small screens - even smaller */}
        <span 
          className={`inline md:hidden ${className} select-none`}
          style={{ 
            whiteSpace: 'nowrap',
            fontSize: '12px', 
            ...style 
          }} 
          {...rest}
        >
          {children}
        </span>
      </>
    );
  }

  /**
   * Component for displaying indented list items in the catalog
   */
    const IndentedListItem = ({ children }) => {
    return (
      <div className="select-none">
        <span className="italic">
          {/* Don't split the text, keep it exactly as provided */}
          {children}
        </span>
      </div>
    );
  };

  /**
   * Component for displaying education items with responsive text
   */
  const EducationItem = ({ institution, year, degreeUrl, degreeName, subtitle, className = '' }) => {
    const fullName = institution;
    const abbrevName = institution === "British Columbia Institute of Technology" ? "BCIT" :
                      institution === "University of British Columbia" ? "UBC" : institution;
    
    return (
      <div className={`flex flex-col mb-2 ${className}`}>
        <div>
          <div className="relative" title={`${institution} (${year})`}>
            {/* Show full name at larger screens, abbreviated at problem widths */}
            <p className="education-institution item-subtitle font-bold text-white whitespace-nowrap overflow-hidden text-xs md:text-xs lg:text-sm mb-0 select-none">
              {/* This is hidden at medium and small screens */}
              <span className="hidden lg:inline">{fullName} ({year})</span>
              {/* This is visible only at medium screens where full name might not fit */}
              <span className="hidden md:inline lg:hidden">
                {(institution === "British Columbia Institute of Technology" || 
                 institution === "University of British Columbia") ? abbrevName : fullName} ({year})
              </span>
              {/* This is visible only at smaller screens */}
              <span className="inline md:hidden">{abbrevName} ({year})</span>
            </p>
          </div>
          <a
            href={degreeUrl}
            className="education-degree text-green-500 hover:text-accent-hover text-xs md:text-xs lg:text-xs select-none"
          >
            {degreeName}
            {subtitle && <span className="block text-xs">{subtitle}</span>}
          </a>
        </div>
      </div>
    );
  };

  /**
   * Component for displaying language items with responsive text
   */
  const LanguageItem = ({ language, level }) => {
    return (
      <div className="language-item flex flex-col overflow-hidden">
        {/* Language name - responsive font sizes using CSS classes */}
        <span className="font-semibold text-white whitespace-nowrap overflow-hidden text-xs md:text-sm lg:text-base select-none">
          {language}
        </span>
        
        {/* Level - responsive font sizes using CSS classes */}
        <span className="italic whitespace-nowrap overflow-hidden text-xs md:text-xs lg:text-sm select-none">
          {level}
        </span>
      </div>
    );
  };

  /**
   * Render a navigation item with appropriate styling
   * @param {Object} item - Navigation item data
   * @param {string} item.id - ID of the item
   * @param {string} item.label - Display label
   * @param {boolean} item.indented - Whether to indent the item
   * @returns {JSX.Element} Rendered navigation button
   */
  const renderNavItem = ({ id, label, indented }) => {
    const extraRightPadding = indented && (id === 'more-about-me' || id === 'interesting-visuals')
      ? ' pr-4'
      : '';
    
    return (
      <button
        key={id}
        onClick={() => handleLayerChange(id)}
        className={`
          nav-item w-full text-left select-none
          ${indented
              ? 'pl-6 md:pl-10 lg:pl-8 text-xs md:text-sm lg:text-base opacity-80 py-2' + extraRightPadding
              : 'px-2 md:px-3 text-base md:text-lg lg:text-xl py-2'
          }
          text-text hover:bg-surface transition-all
          ${activeLayer === id ? 'bg-surface' : ''}
          break-words whitespace-normal
        `}
      >
        {indented ? (
          <SingleLineText className={`item-title font-semibold block text-xs md:text-sm lg:text-base ${activeLayer === id ? 'text-green-500' : 'text-white'}`}>
            {label}
          </SingleLineText>
        ) : (
          <span className={`item-title font-semibold block ${activeLayer === id ? 'text-green-500' : 'text-white'} select-none`}>
            {label}
          </span>
        )}
      </button>
    );
  };

  /**
   * Render the content section based on active layer
   * @param {string} layerId - ID of the layer to render
   * @returns {JSX.Element|null} Rendered content or null if inactive
   */
  const renderContentSection = (layerId) => {
    if (activeLayer !== layerId) return null;
    const aboutClass = layerId === 'about' ? 'max-w-[1100px]' : '';
    
    switch (layerId) {
      case 'about':
        return <div className={aboutClass}><About /></div>;
      case 'more-about-me':
        return <MoreAboutMe />;
      case 'experience':
        return <Experience />;
      case 'education':
        return <Education />;
      case 'latest':
        return <Latest />;
      case 'interesting-visuals':
        return <InterestingVisuals />;
      default:
        return null;
    }
  };

  /**
   * Get the display title for the main content area
   * @param {string} layerId - ID of the active layer
   * @returns {string} Formatted title for display
   */
  const getMainContentTitle = (layerId) => {
    if (layerId === 'latest') {
      return 'Latest Projects';
    } else {
      return layerId === 'about'
        ? 'About Me'
        : layerId.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  // ===== CATALOG DATA =====
  // Data for the catalog sidebar categories and their content
  const categories = [
    {
      id: 'education',
      label: 'Education',
      subcategories: [
        {
          content: (
            <div className="flex flex-col">
              <EducationItem 
                institution="British Columbia Institute of Technology"
                year="2024"
                degreeUrl="https://www.bcit.ca/programs/geographic-information-systems-advanced-diploma-full-time-9100fadvdip/#overview"
                degreeName="Advanced Diploma in GIS"
              />
              <EducationItem 
                institution="University of British Columbia"
                year="2023"
                degreeUrl="https://forestry.ubc.ca/future-students/undergraduate/urban-forestry/"
                degreeName="Bachelor of Urban Forestry"
                subtitle="Minor in Urban Green Space Management"
              />
              <EducationItem 
                institution="British Columbia Institute of Technology"
                year="2018"
                degreeUrl="https://www.bcit.ca/programs/electrical-foundation-certificate-full-time-1780cert/#overview"
                degreeName="Certificate in Electrical Foundations"
                className="mb-0 pb-0" // Further reduce space for last item
              />
            </div>
          ),
        },
      ],
    },
    {
      id: 'technicalSkills',
      label: 'Technical Skills',
      subcategories: [
        {
          label: 'GIS and Spatial Technologies',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>ArcGIS Pro, ArcGIS Online, ArcGIS Portal, ArcGIS Server, ArcGIS Experience Builder, ArcGIS Rest Services, ArcMap, QGIS, ENVI, Catalyst Professional</IndentedListItem>
              <IndentedListItem>FME Form, Metashape, Autocad, Microstation, Google Earth Engine</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Databases',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>PostgreSQL, SQLite, SQL Server, Oracle</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Debugging',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>Fiddler Classic + Everywhere, Postman</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'General Software',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>REST APIs (ArcGIS REST Services, Google Maps, Azure Portal/OpenAI, AWS Bedrock, etc)</IndentedListItem>
              <IndentedListItem>Microsoft Office Suite, Google Suite, LibreOffice, SonyVegas, Photoshop, OBS studio, techsmith</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Remote Sensing',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>Landsat, Sentinel, LiDAR, Photogrammetry</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'General Technical skills',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>Data analysis, Data classification, segmentation and classification, Terrain analysis computer vison, Change Detection/ Time series, Land cover/ Land use classification and analysis, NDVI, NDWI, Tree inventory</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Data Acquisition',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>DJI mini series, Trimble GNSS, GeoSLAMM, Web scraping</IndentedListItem>
            </div>
          ),
        },
      ],
    },
    {
      id: 'softSkills',
      label: 'Soft Skills',
      subcategories: [
        {
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>Adaptability to Change</IndentedListItem>
              <IndentedListItem>Analytical & Technical Writing</IndentedListItem>
              <IndentedListItem>Analytical Thinking</IndentedListItem>
              <IndentedListItem>Attention to Details</IndentedListItem>
              <IndentedListItem>Clear & Concise Communication</IndentedListItem>
              <IndentedListItem>Conflict Management</IndentedListItem>
              <IndentedListItem>Critical Thinking</IndentedListItem>
              <IndentedListItem>Teamwork & Collaboration</IndentedListItem>
            </div>
          ),
        },
      ],
    },
    {
      id: 'programmingLanguages',
      label: 'Programming',
      subcategories: [
        {
          label: 'IDE',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>VS Code, RStudio (Posit), PyCharm, Jupyter Notebook, Python Spyder</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Javascript Libraries + Frameworks',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>Libraries: Leaflet, D3.js, React</IndentedListItem>
              <IndentedListItem>Frameworks: Vite, Calcite Design System, React</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Python Libraries',
          content: (
            <div className="space-y-0.5 text-sm md:text-sm lg:text-base">
              <IndentedListItem>ArcPy, Leafmap, GDAL, Pandas/Geopandas, Rasterio</IndentedListItem>
            </div>
          ),
        },
        {
          label: 'Programming Languages',
          content: (
            <div className="grid grid-cols-2 gap-2 md:gap-1 lg:gap-4">
              <div className="space-y-3">
                <LanguageItem language="Python" level="Proficient" />
                <LanguageItem language="R" level="Intermediate" />
                <LanguageItem language="SQL" level="Intermediate" />
                <LanguageItem language="HTML + CSS" level="Intermediate" />
                <LanguageItem language="Arcade" level="Intermediate" />
              </div>
              <div className="space-y-3">
                <LanguageItem language="JavaScript" level="Novice" />
                <LanguageItem language="Java" level="Novice" />
                <LanguageItem language="PHP" level="Novice" />
                <LanguageItem language="PowerShell" level="Novice" />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: 'languages',
      label: 'Languages',
      subcategories: [
        {
          content: (
            <div className="grid grid-cols-2 gap-2">
              <LanguageItem language="English" level="Native" />
              <LanguageItem language="Korean" level="Intermediate" />
            </div>
          ),
        },
      ],
    },
    {
      id: 'availability',
      label: 'Availability',
      subcategories: [
        {
          content: (
            <div className="flex flex-col gap-4 text-sm md:text-sm lg:text-base">
              <div>
                <p className="font-semibold text-white select-none">Current Status</p>
                <p className="text-text select-none">Available for remote consultations and meetings, but available time slots may be limited.</p>
              </div>
              <div>
                <p className="font-semibold text-white select-none">Response Time</p>
                <p className="text-text select-none">Usually under 72 hours.</p>
              </div>
            </div>
          ),
        },
      ],
    },
  ];

  // Common section header class
  const sectionHeaderClass =
    'section-header text-min-2xl md:text-min-2xl lg:text-min-3xl font-bold text-white mb-1 pb-1 border-b border-surface-border select-none';

  // ===== RENDER COMPONENT =====
  return (
    <div className="layout-container h-full w-full bg-background flex flex-col overflow-hidden max-h-screen">
      <div className="layout-main flex flex-1 w-full overflow-hidden">
        {/* Left sidebar navigation */}
        <nav className="sidebar bg-background-darker border-r border-surface-border p-4 flex flex-col shrink-0 w-[55%] max-w-[160px] base:max-w-[180px] md:max-w-[210px] lg:max-w-[210px]">
          <h2 className={sectionHeaderClass}>Contents</h2>
          <div className="sidebar-nav flex-grow">
            {NAV_ITEMS.map((item, index) => {
              if (index === 0) {
                return (
                  <div key={`group-${index}`} className="nav-group">
                    <div className="nav-item-container mb-0">
                      {renderNavItem(NAV_ITEMS[0])}
                    </div>
                    <div className="nav-item-container mt-0 mb-0">
                      {renderNavItem(NAV_ITEMS[1])}
                    </div>
                  </div>
                );
              } else if (index === 3) {
                return (
                  <div key={`group-${index}`} className="nav-group">
                    <div className="nav-item-container mb-0">
                      {renderNavItem(NAV_ITEMS[3])}
                    </div>
                    <div className="nav-item-container mt-0 mb-0">
                      {renderNavItem(NAV_ITEMS[4])}
                    </div>
                  </div>
                );
              } else if (index === 1 || index === 4) {
                return null; // Skip items that are already rendered in groups
              } else {
                return (
                  <div key={item.id} className="nav-item-container mb-0">
                    {renderNavItem(item)}
                  </div>
                );
              }
            }).filter(Boolean)}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCatalogToggle}
              className="toggle-btn bg-surface text-text px-2 py-1 rounded hover:bg-surface-hover transition-all text-min-sm w-3/4 select-none"
            >
              {catalogOpen ? 'Close' : 'Catalog'}
            </button>
          </div>
        </nav>
        
        {/* Main content area */}
        <main
          ref={contentRef}
          className={`
            content-main flex-grow p-4 text-left text-text relative flex flex-col overflow-hidden
            ${catalogOpen ? 'hidden md:flex md:w-[35%]' : 'flex'}
            transition-all duration-300
          `}
        >
          <h1 className={sectionHeaderClass}>
            {getMainContentTitle(activeLayer)}
          </h1>
          <div className="content-text hide-scrollbar overflow-y-auto overflow-x-hidden break-words pr-2 divide-y divide-surface-border">
            {renderContentSection('latest')}
            {renderContentSection('interesting-visuals')}
            {renderContentSection('about')}
            {renderContentSection('more-about-me')}
            {renderContentSection('experience')}
            {activeLayer === 'education' && renderContentSection('education')}
          </div>
        </main>
        
        {/* Catalog sidebar */}
        <aside
          ref={catalogRef}
          className="catalog-sidebar border-l border-surface-border bg-background-darker overflow-x-hidden"
          style={{
            width: catalogWidth,
            transition: isSmallViewport ? 'none' : 'width 300ms ease, opacity 300ms ease',
            opacity: catalogOpen ? 1 : 0,
            display: (catalogOpen || window.innerWidth >= 768) ? 'block' : 'none'
          }}
        >
          <div className="catalog-content h-full flex flex-col w-full" style={{ 
            opacity: catalogOpen ? 1 : 0, 
            transition: isSmallViewport ? 'none' : 'opacity 300ms ease' 
          }}>
            <div ref={catalogHeaderRef} className="bg-background-darker p-4 pb-0">
              <h2 className={sectionHeaderClass}>Catalog</h2>
            </div>
            <div className="catalog-items flex-1 hide-scrollbar overflow-y-auto">
              <div className="space-y-1 px-4 pt-0">
                {categories.map((cat) => {
                  const isExpanded = toggledCategories[cat.id];
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className="catalog-item bg-surface rounded px-3 py-1 w-full text-left hover:bg-surface-hover cursor-pointer transition-all"
                      onClick={() => handleToggle(cat.id)}
                    >
                      <span className="item-title font-bold text-white block text-lg md:text-xl lg:text-xl select-none pl-0">
                        {cat.label}
                      </span>
                      <div className={`
                        item-content mt-0 pb-0 text-sm md:text-sm lg:text-base text-text transition-all duration-300 overflow-hidden
                        ${isExpanded ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'}
                      `}>
                        {cat.subcategories.map((sub, index) => (
                          <div key={index} className={`category-item ${index !== cat.subcategories.length - 1 ? 'mb-1' : 'mb-0'} ${cat.id === 'languages' || cat.id === 'education' || cat.id === 'programmingLanguages' ? 'overflow-visible' : ''}`}>
                            {sub.label && cat.id !== 'technicalSkills' && cat.id !== 'availability' && !(cat.id === 'programmingLanguages' && sub.label === 'Programming Languages') && (
                              <p className="item-subtitle font-bold text-white mb-0.5 text-sm md:text-sm lg:text-base select-none">
                                {sub.label}
                              </p>
                            )}
                            {sub.label && (cat.id === 'technicalSkills' || cat.id === 'availability') && (
                              <p className="font-bold text-white mb-0.5 text-base md:text-base lg:text-lg select-none">
                                {sub.label}
                              </p>
                            )}
                            {sub.label && (cat.id === 'programmingLanguages' && sub.label === 'Programming Languages') && (
                              <p className="font-bold text-white mb-0.5 text-lg md:text-xl lg:text-xl select-none">
                                {sub.label}
                              </p>
                            )}
                            <div className={`item-description text-text ${cat.id === 'languages' || cat.id === 'education' || cat.id === 'programmingLanguages' ? 'overflow-visible' : ''}`}>
                              {sub.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
      
      {/* Footer bar */}
      <footer className="status-bar bg-background-darker border-t border-surface-border text-text text-xs px-4 h-8 flex items-center justify-between w-full">
        <div className="status-date select-none">Last updated: February 11, 2025</div>
        <div className="status-credit select-none">Information on Dave Choi</div>
      </footer>
    </div>
  );
}