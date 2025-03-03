import React, { useState, useEffect, useRef } from 'react';

// Plain text typewriter.
const Typewriter = ({ text, speed = 12, onComplete, className = '' }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index++;
      setDisplayed(text.slice(0, index));
      if (index === text.length) {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);
  return <span className={className}>{displayed}</span>;
};

// HTML-enabled typewriter with simplified parsing.
const FormattedTypewriter = ({ html, speed = 12, onComplete }) => {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    let currentIndex = 0;
    let newHtml = "";
    const timer = setInterval(() => {
      if (currentIndex >= html.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
        return;
      }
      // If we encounter a tag, copy it entirely.
      if (html[currentIndex] === '<') {
        let tag = "";
        while (currentIndex < html.length && html[currentIndex] !== '>') {
          tag += html[currentIndex];
          currentIndex++;
        }
        if (currentIndex < html.length) {
          tag += html[currentIndex]; // include the closing '>'
          currentIndex++;
        }
        newHtml += tag;
      } else {
        newHtml += html[currentIndex];
        currentIndex++;
      }
      setDisplayed(newHtml);
    }, speed);
    return () => clearInterval(timer);
  }, [html, speed, onComplete]);
  
  return <span dangerouslySetInnerHTML={{ __html: displayed }} />;
};

export const About = () => {
  // Updated paragraphs with hyperlinks styled as requested.
  const paragraphs = [
    "My name is Dave Choi.",
    "I am a spatial data analyst educated in <a href='https://en.wikipedia.org/wiki/Geographic_information_system' target='_blank' rel='noopener noreferrer' style='color: green;'>Geographic Information Systems</a> and <a href='https://en.wikipedia.org/wiki/Urban_forestry' target='_blank' rel='noopener noreferrer' style='color: green;'>Urban Forestry</a>.",
    "I have a keen interest in <a href='https://en.wikipedia.org/wiki/Remote_sensing' target='_blank' rel='noopener noreferrer' style='color: orange;'>remote sensing</a>, <a href='https://en.wikipedia.org/wiki/Database_schema' target='_blank' rel='noopener noreferrer' style='color: orange;'>data schema</a>, and <a href='https://en.wikipedia.org/wiki/Extract,_transform,_load' target='_blank' rel='noopener noreferrer' style='color: orange;'>data pipelines</a>.",
    "I enjoy exploring, visualizing data, and incorporating dynamic elements to workflows and to streamline <span style='color: red;'>data processing</span>, <span style='color: red;'>visualization</span>, and <span style='color: red;'>analysis</span>."
  ];

  const [fadeInHello, setFadeInHello] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  // State to trigger the blinking pipe effect.
  const [showPipe, setShowPipe] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  // Fade in "Hello!" then start the paragraph sequence.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeInHello(true);
      setTimeout(() => {
        setCurrentParagraphIndex(0);
        setIsTyping(true);
      }, 1000);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // When typewriter completes, either proceed to the next paragraph
  // or (if it was the final paragraph) show the blinking pipe.
  const handleTypewriterComplete = () => {
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentParagraphIndex < paragraphs.length - 1) {
        setCurrentParagraphIndex(prev => prev + 1);
        setIsTyping(true);
      } else {
        setShowPipe(true);
      }
    }, 200);
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);
  
  return (
    <div
      className="py-4 pl-0 pr-4 max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none"
      }}
    >
      {/* Inline CSS for the blinking pipe animation */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .blinking-pipe {
            animation: blink 0.8s step-end infinite;
            display: inline-block;
            margin-left: 0;
          }
        `}
      </style>
      <h1
        className="text-3xl md:text-3xl lg:text-5xl font-bold mb-4"
        style={{
          opacity: fadeInHello ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out'
        }}
      >
        Hello!
      </h1>
      {fadeInHello && currentParagraphIndex >= 0 && (
        <div className="space-y-4 ml-0 md:max-w-[400px] lg:max-w-[650px] xl:max-w-[1000px] sm:text-sm md:text-md lg:text-xl xl:text-2xl">
          {paragraphs.map((paragraph, index) => {
            // Already-typed paragraphs.
            if (index < currentParagraphIndex) {
              return paragraph.includes('<') ? (
                <p
                  key={index}
                  className="content-paragraph"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ) : (
                <p
                  key={index}
                  className="content-paragraph"
                >
                  {paragraph}
                </p>
              );
            }
            // Active paragraph.
            else if (index === currentParagraphIndex) {
              return (
                <p
                  key={index}
                  className="content-paragraph"
                >
                  {isTyping ? (
                    paragraph.includes('<') ? (
                      <FormattedTypewriter
                        html={paragraph}
                        speed={10}
                        onComplete={handleTypewriterComplete}
                      />
                    ) : (
                      <Typewriter
                        text={paragraph}
                        speed={10}
                        onComplete={handleTypewriterComplete}
                      />
                    )
                  ) : (
                    <>
                      {paragraph.includes('<') ? (
                        <span dangerouslySetInnerHTML={{ __html: paragraph }} />
                      ) : (
                        paragraph
                      )}
                      {index === paragraphs.length - 1 && showPipe && (
                        <span className="blinking-pipe">|</span>
                      )}
                    </>
                  )}
                </p>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default About;