import React, { useState, useEffect, useRef } from 'react';

// Sample welcome texts
const welcomeTexts = [
  "Welcome!",
  "¡Bienvenidos!",
  "환영합니다!",
  "Bienvenue!",
  "いらっしゃいませ!",
  "歡迎!",
  "Willkommen!",
  "Benvenuto!",
  "Bem-vindo!",
  "Selamat datang!"
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCircle(heroWidth, heroHeight) {
  const radius = 7;
  return {
    id: Date.now() + randomInt(1, 9999),
    x: randomInt(radius, heroWidth - radius),
    y: randomInt(radius, heroHeight - radius),
    radius
  };
}

function createMultipleCircles(count, heroWidth, heroHeight) {
  const circles = [];
  for (let i = 0; i < count; i++) {
    circles.push(createCircle(heroWidth, heroHeight));
  }
  return circles;
}

/**
 * Checks if a circle at position (cx, cy) with a given radius
 * covers all four corners of a rectangular region (heroWidth x heroHeight).
 */
function coversAllCorners(cx, cy, radius, heroWidth, heroHeight) {
  const corners = [
    { x: 0, y: 0 },
    { x: heroWidth, y: 0 },
    { x: heroWidth, y: heroHeight },
    { x: 0, y: heroHeight },
  ];

  return corners.every((corner) => {
    const dx = corner.x - cx;
    const dy = corner.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return radius >= dist;
  });
}

export default function HeroSection() {
  const heroRef = useRef(null);

  // For changing welcome texts
  const [currentWelcomeIndex, setCurrentWelcomeIndex] = useState(0);
  const [isWelcomeFading, setIsWelcomeFading] = useState(false);

  // Hero dimensions
  const [heroWidth, setHeroWidth] = useState(0);
  const [heroHeight, setHeroHeight] = useState(0);

  // Ball movement states
  const [paused, setPaused] = useState(false);
  const [circlePos, setCirclePos] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ vx: 1.2, vy: 1.2 });
  const [mainRadius, setMainRadius] = useState(20);
  const [isFullOverlay, setIsFullOverlay] = useState(false);

  // Small circles and their count (start with 8)
  const [smallCircles, setSmallCircles] = useState([]);
  const MIN_ORB_COUNT = 8;
  const MAX_ORB_COUNT = 80; // Up to 80

  // For tracking drag start and end
  const dragStartPosRef = useRef(null);

  // Settings panel toggle
  const [showSettings, setShowSettings] = useState(false);

  // Speed factor
  const [speedFactor, setSpeedFactor] = useState(1);
  const [sliderValue, setSliderValue] = useState(1);

  // Shaking animation for invalid orb count changes
  const [shakeOrbCount, setShakeOrbCount] = useState(false);
  const [orbCountColor, setOrbCountColor] = useState("text-green-300");

  // Fade state for smooth hiding of the panel
  const [fadeOut, setFadeOut] = useState(false);

  // Timers/intervals for holding plus/minus
  const plusIntervalRef = useRef(null);
  const minusIntervalRef = useRef(null);
  const plusPressTimerRef = useRef(null);
  const minusPressTimerRef = useRef(null);

  // Track whether the user has “held” the button
  const plusHasHeldRef = useRef(false);
  const minusHasHeldRef = useRef(false);

  // Cycle welcome texts
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIsWelcomeFading(true);
      setTimeout(() => {
        setCurrentWelcomeIndex((prevIndex) => (prevIndex + 1) % welcomeTexts.length);
        setIsWelcomeFading(false);
      }, 300);
    }, 3500);

    return () => clearInterval(cycleInterval);
  }, []);

  // Setup hero dimensions and initial circles
  useEffect(() => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setHeroWidth(rect.width);
      setHeroHeight(rect.height);

      // Center the main ball
      setCirclePos({
        x: rect.width / 2,
        y: rect.height / 2,
      });

      // Create initial orbs = 8
      const initial = createMultipleCircles(MIN_ORB_COUNT, rect.width, rect.height);
      setSmallCircles(initial);
    }
  }, []);

  // Main animation loop
  useEffect(() => {
    let animId;

    function bounceLoop() {
      if (paused || isFullOverlay) {
        animId = requestAnimationFrame(bounceLoop);
        return;
      }

      setCirclePos((prevPos) => {
        let { x, y } = prevPos;
        let { vx, vy } = velocity;

        // Move the ball
        x += vx;
        y += vy;

        // Check if circle is large relative to container
        const bigCircle = mainRadius >= Math.min(heroWidth, heroHeight) / 2;

        let minX = mainRadius;
        let maxX = heroWidth - mainRadius;
        let minY = mainRadius;
        let maxY = heroHeight - mainRadius;

        if (bigCircle) {
          // Ball can move a bit "out of bounds" if it's extremely big
          minX = -mainRadius * 0.5;
          maxX = heroWidth + mainRadius * 0.5;
          minY = -mainRadius * 0.5;
          maxY = heroHeight + mainRadius * 0.5;
        }

        // Bounce horizontally
        if (x < minX || x > maxX) {
          x = x < minX ? minX : maxX;
          vx = -vx;
        }
        // Bounce vertically
        if (y < minY || y > maxY) {
          y = y < minY ? minY : maxY;
          vy = -vy;
        }

        // Re-normalize velocity to maintain speedFactor
        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0) {
          vx = (speedFactor * vx) / mag;
          vy = (speedFactor * vy) / mag;
        } else {
          // random direction if somehow zero
          const angle = Math.random() * 2 * Math.PI;
          vx = speedFactor * Math.cos(angle);
          vy = speedFactor * Math.sin(angle);
        }

        // Update velocity state
        setVelocity({ vx, vy });
        return { x, y };
      });

      // Check for orb collisions + potential ball growth
      setSmallCircles((prev) => {
        if (prev.length === 0) return prev;

        const updated = [];
        const consumed = [];

        for (const orb of prev) {
          const dx = orb.x - circlePos.x;
          const dy = orb.y - circlePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mainRadius + orb.radius) {
            consumed.push(orb.id);
          } else {
            updated.push(orb);
          }
        }

        if (consumed.length === 0) {
          // No growth, just return updated as is
          return updated;
        }

        // Ball grows by 3 for each consumed orb
        const newRadius = mainRadius + 3 * consumed.length;
        setMainRadius(newRadius);

        // Check overlay conditions with the new radius
        const threshold = Math.max(heroWidth, heroHeight) * 0.8;
        const nowCoversAllCorners = coversAllCorners(
          circlePos.x,
          circlePos.y,
          newRadius,
          heroWidth,
          heroHeight
        );
        if (nowCoversAllCorners || newRadius >= threshold) {
          // We become full overlay => do not spawn new orbs
          setIsFullOverlay(true);
          return updated; // return the updated array (sans consumed)
        }

        // Otherwise spawn new orbs for each consumed orb
        if (heroRef.current) {
          const rect = heroRef.current.getBoundingClientRect();
          for (let i = 0; i < consumed.length; i++) {
            updated.push(createCircle(rect.width, rect.height));
          }
        }

        return updated;
      });

      animId = requestAnimationFrame(bounceLoop);
    }

    animId = requestAnimationFrame(bounceLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    paused,
    circlePos.x,
    circlePos.y,
    mainRadius,
    heroWidth,
    heroHeight,
    velocity,
    isFullOverlay,
    speedFactor
  ]);

  // Mouse down: pause and place the ball
  const handleMouseDown = (e) => {
    if (!heroRef.current || isFullOverlay) return;
    setPaused(true);

    const rect = heroRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    dragStartPosRef.current = { x: offsetX, y: offsetY };
    setCirclePos({ x: offsetX, y: offsetY });
  };

  // Mouse up: set velocity from drag
  const handleMouseUp = (e) => {
    if (!heroRef.current || !dragStartPosRef.current || isFullOverlay) return;

    const rect = heroRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    let dx = offsetX - dragStartPosRef.current.x;
    let dy = offsetY - dragStartPosRef.current.y;

    let angle = Math.atan2(dy, dx);
    if (dx === 0 && dy === 0) {
      angle = Math.random() * 2 * Math.PI;
    }

    // Magnitude = speedFactor
    const newVx = speedFactor * Math.cos(angle);
    const newVy = speedFactor * Math.sin(angle);

    setVelocity({ vx: newVx, vy: newVy });
    setPaused(false);
  };

  // Mouse move: drag the ball around (only if paused)
  const handleMouseMove = (e) => {
    if (!heroRef.current || isFullOverlay || !paused) return;
    const rect = heroRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const bigCircle = mainRadius >= Math.min(rect.width, rect.height) / 2;
    let minX = mainRadius;
    let maxX = rect.width - mainRadius;
    let minY = mainRadius;
    let maxY = rect.height - mainRadius;

    if (bigCircle) {
      minX = -mainRadius * 0.5;
      maxX = rect.width + mainRadius * 0.5;
      minY = -mainRadius * 0.5;
      maxY = rect.height + mainRadius * 0.5;
    }

    const clampedX = clamp(offsetX, minX, maxX);
    const clampedY = clamp(offsetY, minY, maxY);

    setCirclePos({ x: clampedX, y: clampedY });

    // Consume orbs on drag (similar logic to bounce collision)
    setSmallCircles((prev) => {
      if (prev.length === 0) return prev;

      const updated = [];
      const consumed = [];

      for (const orb of prev) {
        const dx = orb.x - clampedX;
        const dy = orb.y - clampedY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mainRadius + orb.radius) {
          consumed.push(orb.id);
        } else {
          updated.push(orb);
        }
      }

      if (consumed.length === 0) return updated;

      const newRadius = mainRadius + 3 * consumed.length;
      setMainRadius(newRadius);

      // Check overlay conditions
      const threshold = Math.max(rect.width, rect.height) * 0.8;
      const nowCoversAllCorners = coversAllCorners(
        clampedX,
        clampedY,
        newRadius,
        rect.width,
        rect.height
      );

      if (nowCoversAllCorners || newRadius >= threshold) {
        setIsFullOverlay(true);
        return updated; // no new spawns
      }

      // Otherwise, spawn new orbs
      for (let i = 0; i < consumed.length; i++) {
        updated.push(createCircle(rect.width, rect.height));
      }
      return updated;
    });
  };

  // Trigger panel fade-out after 3s if overlaid
  useEffect(() => {
    let hideTimer;
    if (isFullOverlay && showSettings) {
      setFadeOut(false);
      hideTimer = setTimeout(() => {
        setFadeOut(true);
      }, 3000);
    }
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isFullOverlay, showSettings]);

  // Once transition ends, fully hide the panel
  const handleTransitionEnd = () => {
    if (fadeOut) {
      setShowSettings(false);
      setFadeOut(false);
    }
  };

  // Toggle settings panel
  const toggleSettings = (e) => {
    e.stopPropagation();
    if (!showSettings) {
      setFadeOut(false);
    }
    setShowSettings((prev) => !prev);
  };

  // Prevent ball movement inside the panel
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  /**
   * Helper to change orb count by `step` while clamping to [MIN_ORB_COUNT, MAX_ORB_COUNT].
   */
  const changeOrbCountBy = (step) => {
    const currentCount = smallCircles.length;
    let newCount = currentCount + step;

    // Clamp to [8, 80]
    if (newCount > MAX_ORB_COUNT) newCount = MAX_ORB_COUNT;
    if (newCount < MIN_ORB_COUNT) newCount = MIN_ORB_COUNT;

    // If there's no change, do shaking
    if (newCount === currentCount) {
      setOrbCountColor("text-red-400");
      setShakeOrbCount(true);

      setTimeout(() => {
        setShakeOrbCount(false);
        setOrbCountColor(
          currentCount === MIN_ORB_COUNT || currentCount === MAX_ORB_COUNT
            ? "text-gray-300"
            : "text-green-300"
        );
      }, 300);
      return;
    }

    // Update color
    setOrbCountColor(
      newCount === MIN_ORB_COUNT || newCount === MAX_ORB_COUNT
        ? "text-gray-300"
        : "text-green-300"
    );

    // Adjust orbs array
    if (newCount > currentCount && heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      // Add as many orbs as needed
      for (let i = currentCount; i < newCount; i++) {
        smallCircles.push(createCircle(rect.width, rect.height));
      }
      setSmallCircles([...smallCircles]);
    } else if (newCount < currentCount) {
      // Remove orbs from the end
      smallCircles.splice(newCount, currentCount - newCount);
      setSmallCircles([...smallCircles]);
    }
  };

  // ---------- PLUS BUTTON HANDLERS ----------
  const handlePlusClick = () => {
    if (!plusHasHeldRef.current) {
      changeOrbCountBy(1);
    }
    plusHasHeldRef.current = false;
  };

  const handlePlusPointerDown = (e) => {
    e.preventDefault();
    plusHasHeldRef.current = false;

    // Start a timer that, after 300ms, repeatedly increments by 10
    plusPressTimerRef.current = setTimeout(() => {
      plusHasHeldRef.current = true;
      plusIntervalRef.current = setInterval(() => {
        changeOrbCountBy(10);
      }, 300);
    }, 300);
  };

  const handlePlusPointerUpOrLeave = () => {
    if (plusPressTimerRef.current) {
      clearTimeout(plusPressTimerRef.current);
      plusPressTimerRef.current = null;
    }
    if (plusIntervalRef.current) {
      clearInterval(plusIntervalRef.current);
      plusIntervalRef.current = null;
    }
  };

  // ---------- MINUS BUTTON HANDLERS ----------
  const handleMinusClick = () => {
    if (!minusHasHeldRef.current) {
      changeOrbCountBy(-1);
    }
    minusHasHeldRef.current = false;
  };

  const handleMinusPointerDown = (e) => {
    e.preventDefault();
    minusHasHeldRef.current = false;

    // Start a timer that, after 300ms, repeatedly decrements by 10
    minusPressTimerRef.current = setTimeout(() => {
      minusHasHeldRef.current = true;
      minusIntervalRef.current = setInterval(() => {
        changeOrbCountBy(-10);
      }, 300);
    }, 300);
  };

  const handleMinusPointerUpOrLeave = () => {
    if (minusPressTimerRef.current) {
      clearTimeout(minusPressTimerRef.current);
      minusPressTimerRef.current = null;
    }
    if (minusIntervalRef.current) {
      clearInterval(minusIntervalRef.current);
      minusIntervalRef.current = null;
    }
  };

  /**
   * Fully reset all states, including orbs.
   */
  const handleRestart = (e) => {
    e.stopPropagation();

    // 1) Pause so no collisions/respawns occur right now
    setPaused(true);

    // 2) Reset overlay and the main ball
    setIsFullOverlay(false);
    setMainRadius(20);

    // Re-center the main ball
    setCirclePos({ x: heroWidth / 2, y: heroHeight / 2 });

    // 3) Clear out smallCircles immediately
    setSmallCircles([]);

    // (Optional) close settings & remove fade state
    setShowSettings(false);
    setFadeOut(false);

    // 4) On the *next* tick, create new orbs and un-pause
    setTimeout(() => {
      if (heroRef.current) {
        // Recalculate container size in case it changed
        const rect = heroRef.current.getBoundingClientRect();
        setHeroWidth(rect.width);
        setHeroHeight(rect.height);

        // Recreate orbs = 8
        const newCircles = createMultipleCircles(MIN_ORB_COUNT, rect.width, rect.height);
        setSmallCircles(newCircles);
      }

      // Reset velocity with current speedFactor
      const angle = Math.random() * 2 * Math.PI;
      setVelocity({
        vx: speedFactor * Math.cos(angle),
        vy: speedFactor * Math.sin(angle),
      });

      // Finally unpause
      setPaused(false);
    }, 0);
  };

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-screen overflow-hidden select-none"
      style={{
        backgroundImage: "url('src/assets/background.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />

      {/* Full green overlay if isFullOverlay is true */}
      {isFullOverlay ? (
        <div className="absolute inset-0 bg-green-700 opacity-70 mix-blend-screen z-20" />
      ) : (
        <div
          className="absolute bg-green-700 opacity-70 rounded-full pointer-events-none mix-blend-screen z-20"
          style={{
            width: `${mainRadius * 2}px`,
            height: `${mainRadius * 2}px`,
            transform: `translate(${circlePos.x - mainRadius}px, ${circlePos.y - mainRadius}px)`,
            transition: paused ? 'transform 0.05s linear' : 'none',
          }}
        />
      )}

      {/* Small circles */}
      {!isFullOverlay &&
        smallCircles.map((orb) => (
          <div
            key={orb.id}
            className="absolute rounded-full pointer-events-none z-20 bg-green-900 opacity-60"
            style={{
              width: orb.radius * 2,
              height: orb.radius * 2,
              transform: `translate(${orb.x - orb.radius}px, ${orb.y - orb.radius}px)`,
            }}
          />
        ))}

      {/* Welcome text container */}
      <div className="relative z-30 flex items-center justify-center h-full px-4">
        {/* Desktop view: original hover effect */}
        <div className="hidden md:relative md:group md:inline-block">
          <h1
            className={`text-6xl font-bold text-center text-white transition-opacity duration-300 ${
              isWelcomeFading ? 'opacity-0' : 'opacity-100'
            } group-hover:opacity-0`}
          >
            {welcomeTexts[currentWelcomeIndex]}
          </h1>
          <h1
            className="text-6xl font-bold text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            Dave Choi's Website
          </h1>
        </div>
        {/* Mobile view: stacked text */}
        <div className="md:hidden text-center">
          <h1 className="text-5xl font-bold text-white">
            {welcomeTexts[currentWelcomeIndex]}
          </h1>
          <h2 className="text-4xl font-bold text-white mt-2">
            to<br></br>Dave Choi's Website
          </h2>
        </div>
      </div>

      {/* Conditional Buttons (Gear vs. Reset) */}
      {!isFullOverlay ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSettings(e);
          }}
          className="absolute bottom-4 left-4 z-40 text-white bg-black bg-opacity-50 hover:bg-opacity-80
                     rounded-full w-12 h-12 flex items-center justify-center transition duration-300"
        >
          <span className="text-xl">&#9881;</span>
        </button>
      ) : (
        <button
          onClick={handleRestart}
          className="absolute bottom-4 left-4 z-40 text-white bg-black bg-opacity-50 hover:bg-opacity-80
                     rounded-full w-12 h-12 flex items-center justify-center transition duration-300"
        >
          <span className="text-xl">&#10227;</span>
        </button>
      )}

      {/* Settings Panel */}
      {showSettings && !isFullOverlay && (
        <div
          className="absolute bottom-16 left-4 z-40 bg-black bg-opacity-80 p-4 rounded-md shadow-md w-60"
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
          onPointerLeave={() => {
            // Stop intervals if pointer leaves the panel area
            handlePlusPointerUpOrLeave();
            handleMinusPointerUpOrLeave();
          }}
        >
          {/* Speed Control (Absolute Velocity) */}
          <div className="mb-4 flex flex-col">
            <label htmlFor="speedRange" className="text-white mb-1">
              Speed Factor
            </label>
            <input
              id="speedRange"
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseFloat(e.target.value))}
              onPointerUp={() => {
                if (!isFullOverlay) {
                  setSpeedFactor(sliderValue);
                  // Re-normalize velocity to match the new speed
                  setVelocity((prevVel) => {
                    const { vx, vy } = prevVel;
                    const mag = Math.sqrt(vx * vx + vy * vy);
                    if (mag > 0) {
                      const newVx = (sliderValue * vx) / mag;
                      const newVy = (sliderValue * vy) / mag;
                      return { vx: newVx, vy: newVy };
                    } else {
                      // random direction if speed was 0
                      const angle = Math.random() * 2 * Math.PI;
                      return {
                        vx: sliderValue * Math.cos(angle),
                        vy: sliderValue * Math.sin(angle),
                      };
                    }
                  });
                }
              }}
              className="w-full"
            />
            <span className="text-white mt-1 text-sm">
              {sliderValue.toFixed(1)} units / frame
            </span>
          </div>

          {/* Orb Count Control */}
          <div className="mb-2 text-white">Number of Orbs:</div>
          <div className="flex items-center justify-between">
            {/* MINUS button */}
            <button
              onClick={handleMinusClick}
              onPointerDown={handleMinusPointerDown}
              onPointerUp={handleMinusPointerUpOrLeave}
              className="text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
            >
              -
            </button>

            <span
              className={`mx-2 ${orbCountColor} ${
                shakeOrbCount ? "animate-shake" : ""
              }`}
            >
              {smallCircles.length}
            </span>

            {/* PLUS button */}
            <button
              onClick={handlePlusClick}
              onPointerDown={handlePlusPointerDown}
              onPointerUp={handlePlusPointerUpOrLeave}
              className="text-white bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
            >
              +
            </button>
          </div>
          <div className="text-gray-400 text-xs mt-1">
            - Single click: ±1<br />
            - Hold: ±10 repeatedly (clamps 8–80)
          </div>
        </div>
      )}

      {/* If fully overlaid, show a simple message with fade */}
      {isFullOverlay && showSettings && (
        <div
          onTransitionEnd={handleTransitionEnd}
          className={`absolute bottom-16 left-4 z-40 bg-black bg-opacity-80 p-4 rounded-md shadow-md w-60 text-white flex items-center justify-center 
            transition-opacity duration-1000 ${fadeOut ? "opacity-0" : "opacity-100"}`}
          onMouseDown={stopPropagation}
          onMouseUp={stopPropagation}
        >
          Nothing to modify here
        </div>
      )}
    </section>
  );
}
