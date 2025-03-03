import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import p5 from 'p5';

export const InterestingVisuals = () => {
  /***************************************************************************
   * Custom hook to detect tab visibility changes
   ***************************************************************************/
  const useVisibilityChange = () => {
    const [isVisible, setIsVisible] = useState(true);
    
    useEffect(() => {
      const handleVisibilityChange = () => {
        setIsVisible(!document.hidden);
      };
      
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, []);
    
    return isVisible;
  };

  const isVisible = useVisibilityChange();
  
  /***************************************************************************
   * State declarations for all visualizations
   ***************************************************************************/
  // Active visualization tracker - controls which visualization can run
  const [activeViz, setActiveViz] = useState(null); // 'mandelbrot' or 'lorenz' or null
  
  // Lorenz related state
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false);
  
  // Mandelbrot related state
  const [mandelbrotRunning, setMandelbrotRunning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [zoomStarted, setZoomStarted] = useState(false);

  /***************************************************************************
   * Refs for all visualizations
   ***************************************************************************/
  // Timing and animation refs
  const pauseOffsetRef = useRef(0);
  const pauseStartedAtRef = useRef(null);
  const pausedRef = useRef(paused);
  const runningRef = useRef(running);
  const startTimeRef = useRef(Date.now());
  
  // DOM refs for p5 canvases
  const mandelbrotRef = useRef(null);
  const attractorRef = useRef(null);
  const trackingRef = useRef(null);
  const accumulatedRef = useRef(null);
  
  // Visualization data refs
  const mandelbrotInstanceRef = useRef(null);
  const lorenzState = useRef({ x: 0.1, y: 0, z: 0 });
  const trackingDataRef = useRef([]);
  
  // Constants
  const TIME_WINDOW = 10000; 
  
  /***************************************************************************
   * Update refs when state changes
   ***************************************************************************/
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Add effect to update runningRef when running state changes
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    // Update zoomStarted state based on activeViz and mandelbrotRunning
    if (activeViz === 'mandelbrot' && mandelbrotRunning) {
      setZoomStarted(true);
    } else if (activeViz !== 'mandelbrot') {
      setZoomStarted(false);
    }
  }, [activeViz, mandelbrotRunning]);

  /***************************************************************************
   * Tab visibility effect - pause when tab not visible
   ***************************************************************************/
  useEffect(() => {
    // When tab becomes invisible, pause all visualizations
    if (!isVisible) {
      setPaused(true);
      pauseStartedAtRef.current = Date.now();
      
      // Also pause Mandelbrot if it's running
      if (mandelbrotRunning) {
        setMandelbrotRunning(false);
      }
    } else if (isVisible && pausedRef.current && runningRef.current && activeViz === 'lorenz') {
      // Only resume Lorenz if it was running before and is the active visualization
      setPaused(false);
      if (pauseStartedAtRef.current !== null) {
        pauseOffsetRef.current += Date.now() - pauseStartedAtRef.current;
        pauseStartedAtRef.current = null;
      }
    } else if (isVisible && !mandelbrotRunning && activeViz === 'mandelbrot') {
      // Resume Mandelbrot if it's the active visualization
      setMandelbrotRunning(true);
    }
  }, [isVisible, activeViz, mandelbrotRunning]);

  /***************************************************************************
   * Helper functions
   ***************************************************************************/
  // Get unpause time with offset adjustment
  const getUnpausedTime = useCallback(() =>
    Date.now() - startTimeRef.current - pauseOffsetRef.current,
  []);

  /***************************************************************************
   * Toggle functions for visualizations
   ***************************************************************************/
  // Start/Stop handler for the Mandelbrot zoom.
  const toggleMandelbrotZoom = useCallback(() => {
    if (zoomStarted) {
      // If already zooming, stop and reset
      if (mandelbrotInstanceRef.current) {
        mandelbrotInstanceRef.current.zoomVal = 1;
      }
      
      // If Mandelbrot is currently running, pause it first
      if (mandelbrotRunning) {
        setMandelbrotRunning(false);
      }
      
      // Set zoom state to stopped
      setZoomStarted(false);
      setActiveViz(null);
      
    } else {
      // If not zooming, start it
      // Reset the zoom factor to 1 and start zooming again
      if (mandelbrotInstanceRef.current) {
        mandelbrotInstanceRef.current.zoomVal = 1;
      }
      
      // Set Mandelbrot as the active visualization
      setActiveViz('mandelbrot');
      
      // If Lorenz is running, pause it
      if (running) {
        setRunning(false);
        setPaused(true);
        pauseStartedAtRef.current = Date.now();
      }
      
      // Make sure Mandelbrot is running
      setMandelbrotRunning(true);
      
      // Set zoom state to started
      setZoomStarted(true);
      
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 820); // Animation duration + small buffer
    }
  }, [running, mandelbrotRunning, zoomStarted]);
  
  // Start/Pause toggle for Lorenz visualization
  const toggleRunning = useCallback(() => {
    setRunning(prev => {
      const next = !prev;
      
      if (next) {
        // Set Lorenz as the active visualization
        setActiveViz('lorenz');
        
        // If Mandelbrot is running, pause it
        if (mandelbrotRunning) {
          setMandelbrotRunning(false);
        }
        
        // Make sure we're not paused
        setPaused(false);
        if (pauseStartedAtRef.current !== null) {
          pauseOffsetRef.current += Date.now() - pauseStartedAtRef.current;
          pauseStartedAtRef.current = null;
        }
      } else {
        // If stopping, pause the visualization but still allow using Mandelbrot
        setPaused(true);
        pauseStartedAtRef.current = Date.now();
        // Don't set activeViz to null so we can resume where we left off
      }
      
      return next;
    });
  }, [mandelbrotRunning]);

  /***************************************************************************
   * Mandelbrot configuration
   ***************************************************************************/
  // Mandelbrot configuration options
  const mandelbrotOptions = useMemo(() => ({
    canvasWidth: 600,
    canvasHeight: 400,
    maxZoom: 1.00e5, // Clean max zoom value
    maxIterations: 100,
    centerX: -0.743643887037158704752191506114774,
    centerY: 0.131825904205311970493132056385139,
    zoomFactor: 1.05, // Increased from 1.025 for faster zoom
  }), []);

  /***************************************************************************
   * MANDELBROT ZOOM VISUALIZATION
   ***************************************************************************/
  useEffect(() => {
    let mandelbrotSketch = new p5((p) => {
      // Use a property on the p5 instance to track the current zoom
      p.zoomVal = 1;
      
      p.setup = () => {
        // Get parent div dimensions to ensure we fit the entire view
        const parentDiv = mandelbrotRef.current.parentElement;
        const parentWidth = parentDiv.clientWidth;
        const parentHeight = parentDiv.clientHeight;
        
        p.createCanvas(parentWidth, parentHeight);
        p.pixelDensity(1);
        p.colorMode(p.HSB, 255);
      };

      p.windowResized = () => {
        // Resize canvas when window resizes to maintain fit
        const parentDiv = mandelbrotRef.current.parentElement;
        const parentWidth = parentDiv.clientWidth;
        const parentHeight = parentDiv.clientHeight;
        p.resizeCanvas(parentWidth, parentHeight);
      };

      // Calculate the correct aspect ratio to show the entire Mandelbrot set
      const calculateViewport = () => {
        const aspectRatio = p.width / p.height;
        // Fixed width based on zoom factor to ensure we focus on the right area
        const width = 3.5 / p.zoomVal;
        const height = width / aspectRatio;
        
        return {
          xMin: mandelbrotOptions.centerX - width / 2,
          xMax: mandelbrotOptions.centerX + width / 2,
          yMin: mandelbrotOptions.centerY - height / 2,
          yMax: mandelbrotOptions.centerY + height / 2
        };
      };

      // Optimized Mandelbrot rendering
      p.draw = () => {
        p.background(34); // Using background color from theme (#222222)
        
        // Only update the zoom if the sketch is running, visible, and Mandelbrot is the active visualization
        if (mandelbrotRunning && isVisible && p.zoomVal < mandelbrotOptions.maxZoom && activeViz === 'mandelbrot') {
          p.zoomVal *= mandelbrotOptions.zoomFactor;
        }
        
        // Set willReadFrequently attribute to true for better performance
        const canvas = document.getElementById(mandelbrotRef.current.children[0].id);
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
        }
        
        p.loadPixels();
        
        // Get viewport dimensions based on current zoom and aspect ratio
        const viewport = calculateViewport();
        
        // For each pixel, map to the complex plane using the current zoom level.
        // Optimization: Process chunks of the screen to allow UI to remain responsive
        const chunkSize = 10; // Process 10 rows at a time
        
        for (let x = 0; x < p.width; x++) {
          for (let y = 0; y < p.height; y += chunkSize) {
            // Process a chunk of rows
            for (let yOffset = 0; yOffset < chunkSize && y + yOffset < p.height; yOffset++) {
              const currentY = y + yOffset;
              
              let a = p.map(
                x,
                0,
                p.width,
                viewport.xMin,
                viewport.xMax
              );
              
              let b = p.map(
                currentY,
                0,
                p.height,
                viewport.yMin,
                viewport.yMax
              );
              
              let ca = a;
              let cb = b;
              let n = 0;
              
              // Main Mandelbrot algorithm
              while (n < mandelbrotOptions.maxIterations) {
                let aa = a * a - b * b;
                let bb = 2 * a * b;
                a = aa + ca;
                b = bb + cb;
                if (a * a + b * b > 16) break;
                n++;
              }
              
              const index = (x + currentY * p.width) * 4;
              // If max iterations are reached, color the pixel black.
              if (n === mandelbrotOptions.maxIterations) {
                p.pixels[index] = 0;
                p.pixels[index + 1] = 0;
                p.pixels[index + 2] = 0;
                p.pixels[index + 3] = 255;
              } else {
                // Use colors based on the theme
                const hue = p.map(n, 0, mandelbrotOptions.maxIterations, 140, 220); // Teal-ish range
                const saturation = 200;
                const brightness = 180;
                const col = p.color(hue, saturation, brightness);
                
                p.pixels[index] = p.red(col);
                p.pixels[index + 1] = p.green(col);
                p.pixels[index + 2] = p.blue(col);
                p.pixels[index + 3] = 255;
              }
            }
          }
        }
        
        p.updatePixels();

        // Display the current magnification as an overlay with improved styling
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        
        // Format the zoom value to have a cleaner scientific notation
        const formattedZoom = p.zoomVal.toExponential(2).replace('+', '');
        
        // Add a semi-transparent background for better text legibility with proper width
        p.fill(26, 180); // #1a1a1a with alpha
        const labelText = `Magnification: ${formattedZoom}x`;
        const labelWidth = p.textWidth(labelText) + 20; // Get the actual width needed
        p.rect(5, 5, labelWidth, 30);
        
        p.fill(204); // #cccccc
        p.text(labelText, 10, 12);
      };
    }, mandelbrotRef.current);
    
    mandelbrotInstanceRef.current = mandelbrotSketch;
    
    return () => mandelbrotSketch.remove();
  }, [mandelbrotRunning, mandelbrotOptions, activeViz, isVisible]);

  /***************************************************************************
   * LORENZ ATTRACTOR (3D) VISUALIZATION
   ***************************************************************************/
  useEffect(() => {
    let attractorSketch = new p5((p) => {
      const canvasWidth = 600;
      const canvasHeight = 400;
      let x = 0.1, y = 0, z = 0;
      const sigma = 10, rho = 28, beta = 8.0 / 3.0;
      const dt = 0.01; // Restored to original speed
      let points = [];
      let hue = 0;
      const MAX_POINTS = 2000; // Restored to original trail length
      
      // Color mapping function to create rainbow effect
      const getColorFromHue = (h) => {
        // Map the hue range of 0-360 to create a rainbow effect starting from red
        return p.color((h + 0) % 360, 255, 255); // Starting from red (0)
      };

      // Function to draw an arrow at the end of an axis
      const drawArrow = (x1, y1, z1, x2, y2, z2, arrowSize = 5) => {
        // Draw the main line
        p.line(x1, y1, z1, x2, y2, z2);
        
        // Calculate direction vector
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        
        // Normalize the direction vector
        const mag = p.sqrt(dx*dx + dy*dy + dz*dz);
        const dirX = dx / mag;
        const dirY = dy / mag;
        const dirZ = dz / mag;
        
        // Calculate a point slightly before the end for the arrow
        const arrowBaseX = x2 - dirX * arrowSize;
        const arrowBaseY = y2 - dirY * arrowSize;
        const arrowBaseZ = z2 - dirZ * arrowSize;
        
        // Create two perpendicular vectors for the arrowhead
        // First perpendicular vector (arbitrary but consistent)
        let perpX = -dirY;
        let perpY = dirX;
        let perpZ = 0;
        
        // If direction is parallel to Z-axis, use a different perpendicular vector
        if (Math.abs(dirX) < 0.001 && Math.abs(dirY) < 0.001) {
          perpX = 1;
          perpY = 0;
          perpZ = 0;
        }
        
        // Normalize the perpendicular vector
        const perpMag = p.sqrt(perpX*perpX + perpY*perpY + perpZ*perpZ);
        perpX /= perpMag;
        perpY /= perpMag;
        perpZ /= perpMag;
        
        // Second perpendicular vector (cross product)
        const perpX2 = dirY * perpZ - dirZ * perpY;
        const perpY2 = dirZ * perpX - dirX * perpZ;
        const perpZ2 = dirX * perpY - dirY * perpX;
        
        // Draw the arrowhead (four sides of a pyramid)
        const arrowheadSize = arrowSize * 0.7;
        
        p.beginShape();
        // Tip of the arrow
        p.vertex(x2, y2, z2);
        // First point around the base
        p.vertex(
          arrowBaseX + perpX * arrowheadSize,
          arrowBaseY + perpY * arrowheadSize,
          arrowBaseZ + perpZ * arrowheadSize
        );
        // Second point around the base
        p.vertex(
          arrowBaseX + perpX2 * arrowheadSize,
          arrowBaseY + perpY2 * arrowheadSize,
          arrowBaseZ + perpZ2 * arrowheadSize
        );
        p.endShape(p.CLOSE);
        
        p.beginShape();
        // Tip of the arrow
        p.vertex(x2, y2, z2);
        // Second point around the base
        p.vertex(
          arrowBaseX + perpX2 * arrowheadSize,
          arrowBaseY + perpY2 * arrowheadSize,
          arrowBaseZ + perpZ2 * arrowheadSize
        );
        // Third point around the base
        p.vertex(
          arrowBaseX - perpX * arrowheadSize,
          arrowBaseY - perpY * arrowheadSize,
          arrowBaseZ - perpZ * arrowheadSize
        );
        p.endShape(p.CLOSE);
        
        p.beginShape();
        // Tip of the arrow
        p.vertex(x2, y2, z2);
        // Third point around the base
        p.vertex(
          arrowBaseX - perpX * arrowheadSize,
          arrowBaseY - perpY * arrowheadSize,
          arrowBaseZ - perpZ * arrowheadSize
        );
        // Fourth point around the base
        p.vertex(
          arrowBaseX - perpX2 * arrowheadSize,
          arrowBaseY - perpY2 * arrowheadSize,
          arrowBaseZ - perpZ2 * arrowheadSize
        );
        p.endShape(p.CLOSE);
        
        p.beginShape();
        // Tip of the arrow
        p.vertex(x2, y2, z2);
        // Fourth point around the base
        p.vertex(
          arrowBaseX - perpX2 * arrowheadSize,
          arrowBaseY - perpY2 * arrowheadSize,
          arrowBaseZ - perpZ2 * arrowheadSize
        );
        // First point around the base
        p.vertex(
          arrowBaseX + perpX * arrowheadSize,
          arrowBaseY + perpY * arrowheadSize,
          arrowBaseZ + perpZ * arrowheadSize
        );
        p.endShape(p.CLOSE);
      };

      p.setup = () => {
        // Get parent div dimensions to ensure we fill the available space
        const parentDiv = attractorRef.current.parentElement;
        const parentWidth = parentDiv.clientWidth;
        const parentHeight = parentDiv.clientHeight;
        
        p.createCanvas(parentWidth, parentHeight, p.WEBGL);
        p.colorMode(p.HSB);
        // Load a font for the axis labels
        p.textFont('Arial');
        // Position the camera closer (z=150) so the attractor is more zoomed in.
        // Position the camera to always keep the attractor centered
        // Flipped the camera to view the attractor upside down
        p.camera(180, -180, 150, 0, 0, 0, 0, -1, 0);
        // Adjust rotation for viewing the attractor upside down
        p.rotateX(p.PI / 5);
        p.rotateY(p.PI / 5);
      };
      
      p.windowResized = () => {
        // Handle window resize to maintain responsive layout
        const parentDiv = attractorRef.current.parentElement;
        const parentWidth = parentDiv.clientWidth;
        const parentHeight = parentDiv.clientHeight;
        p.resizeCanvas(parentWidth, parentHeight);
      };
      
      p.draw = () => {
        p.background(34); // Using theme background color (#222222)
        // Let user orbit if they want.
        p.orbitControl();
        // Update Lorenz system if not paused, running, visible, and Lorenz is the active visualization.
        if (!pausedRef.current && runningRef.current && isVisible && activeViz === 'lorenz') {
          const dx = sigma * (y - x) * dt;
          const dy = (x * (rho - z) - y) * dt;
          const dz = (x * y - beta * z) * dt;
          x += dx;
          y += dy;
          z += dz;
          lorenzState.current = { x, y, z };

          // Add new point to the trail.
          const now = getUnpausedTime();
          
          // Normalize X, Y, Z values for tracking
          let normalizedX = x / 20;
          normalizedX = p.constrain(normalizedX, -5, 5);
          
          let normalizedY = y / 6;
          normalizedY = p.constrain(normalizedY, -5, 5);
          
          let normalizedZ = z / 10;
          normalizedZ = p.constrain(normalizedZ, -5, 5);
          
          trackingDataRef.current.push({ 
            time: now, 
            x: normalizedX,
            y: normalizedY,
            z: normalizedZ
          });

          points.push({ x, y, z, hue });
          hue = (hue + 0.1) % 360;
          if (points.length > MAX_POINTS) {
            points.shift();
          }
        }

        // Draw the Lorenz trail with rainbow coloring starting from red
        p.push();
        p.noFill();
        p.strokeWeight(1.2); // Slightly thicker for better visibility
        
        // Draw line segments with gradient coloring for smoother transitions
        for (let i = 1; i < points.length; i++) {
          const pt1 = points[i-1];
          const pt2 = points[i];
          
          // Use the rainbow coloring function
          const color1 = getColorFromHue(pt1.hue);
          const color2 = getColorFromHue(pt2.hue);
          
          p.stroke(color1);
          p.beginShape(p.LINES);
          p.vertex(pt1.x, pt1.y, pt1.z);
          p.vertex(pt2.x, pt2.y, pt2.z);
          p.endShape();
        }
        p.pop();

        // Draw the 3D axes with thin white lines and labels
        p.push();
        p.noFill();
        p.strokeWeight(0.5); // Thin lines
        p.stroke(255); // Pure white color for all axes
        
        // X-axis with arrow
        drawArrow(-50, 0, 0, 50, 0, 0, 4);
        p.push();
        p.translate(55, 0, 0);
        p.fill(255);
        p.noStroke();
        p.text("X", 0, 0);
        p.pop();
        
        // Y-axis with arrow
        drawArrow(0, -50, 0, 0, 50, 0, 4);
        p.push();
        p.translate(0, 55, 0);
        p.fill(255);
        p.noStroke();
        p.text("Y", 0, 0);
        p.pop();
        
        // Z-axis with arrow
        drawArrow(0, 0, -50, 0, 0, 50, 4);
        p.push();
        p.translate(0, 0, 55);
        p.fill(255);
        p.noStroke();
        p.text("Z", 0, 0);
        p.pop();
        
        p.pop();
      };
    }, attractorRef.current);
    
    return () => attractorSketch.remove();
  }, [getUnpausedTime, isVisible, activeViz]);

  /***************************************************************************
   * LIVE TRACKING (15s Window) VISUALIZATION
   ***************************************************************************/
  useEffect(() => {
    let liveGraphSketch = new p5((p) => {
      let canvasWidth, canvasHeight;
      
      p.setup = () => {
        // Get parent div dimensions to ensure we fill the available space
        const parentDiv = trackingRef.current.parentElement;
        canvasWidth = parentDiv.clientWidth;
        canvasHeight = parentDiv.clientHeight;
        
        p.createCanvas(canvasWidth, canvasHeight);
        p.textFont('sans-serif');
      };
      
      p.windowResized = () => {
        // Handle window resize to maintain responsive layout
        const parentDiv = trackingRef.current.parentElement;
        canvasWidth = parentDiv.clientWidth;
        canvasHeight = parentDiv.clientHeight;
        p.resizeCanvas(canvasWidth, canvasHeight);
      };
      
      p.draw = () => {
        p.background(34); // Using theme background color (#222222)
        
        // Draw grid lines for better readability
        p.stroke(70);
        p.strokeWeight(0.5);
        // Use larger range for y-axis: -10 to 10 instead of -5 to 5
        for (let i = 0; i <= 20; i++) {
          let y = p.map(i, 0, 20, canvasHeight, 0);
          p.line(0, y, canvasWidth, y);
        }
        for (let i = 0; i <= 10; i++) {
          let x = p.map(i, 0, 10, 0, canvasWidth);
          p.line(x, 0, x, canvasHeight);
        }
        
        // Draw axes with improved styling
        p.stroke(204); // #cccccc
        p.strokeWeight(1.5);
        p.line(0, canvasHeight/2, canvasWidth, canvasHeight/2); // X-axis at y=0
        p.line(0, 0, 0, canvasHeight);
        
        p.textSize(14);
        // Updated tick marks for expanded range (-10 to 10)
        const ticks = [-10, -5, 0, 5, 10]; 
        ticks.forEach((tick) => {
          const yPos = p.map(tick, -10, 10, canvasHeight, 0);
          p.stroke(204);
          p.line(0, yPos, 8, yPos);
          p.noStroke();
          p.fill(204); // #cccccc
          p.text(tick, 12, yPos + 5);
        });
        
        // Add time axis labels
        const timeLabels = [0, 5000, 10000, 15000];
        timeLabels.forEach((time) => {
          const xPos = p.map(time, 0, TIME_WINDOW, 0, canvasWidth);
          const label = time / 1000 + 's';
          p.noStroke();
          p.fill(204);
          p.textAlign(p.CENTER, p.TOP);
          p.text(label, xPos, canvasHeight - 20);
        });
        
        // Add axis labels with better positioning
        p.noStroke();
        p.fill(204);
        p.textSize(16);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text('Time (s)', canvasWidth - 5, canvasHeight - 5);
        p.textAlign(p.CENTER, p.TOP);
        p.text('Value', 30, 5);

        const data = trackingDataRef.current;
        if (data.length === 0) return;
        
        const currentTime = pausedRef.current
          ? data[data.length - 1].time
          : getUnpausedTime();
        const windowStart = currentTime - TIME_WINDOW;
        const windowData = data.filter(d => d.time >= windowStart);
        
        // Get last data point for current values
        const lastData = windowData.length > 0 ? windowData[windowData.length - 1] : { x: 0, y: 0, z: 0 };
        
        // Add a legend in the top right with current values
        p.fill(26, 180); // Background for legend
        p.rect(canvasWidth - 120, 10, 110, 70);
        
        p.textAlign(p.LEFT, p.CENTER);
        // X value with color
        p.fill(255, 0, 0); // Red for X
        p.text(`X: ${lastData.x.toFixed(2)}`, canvasWidth - 110, 25);
        
        // Y value with color
        p.fill(0, 120, 255); // Blue for Y
        p.text(`Y: ${lastData.y.toFixed(2)}`, canvasWidth - 110, 45);
        
        // Z value with color
        p.fill(255, 120, 0); // Orange for Z
        p.text(`Z: ${lastData.z.toFixed(2)}`, canvasWidth - 110, 65);

        // Draw the X position data line with glow effect
        p.drawingContext.shadowBlur = 8;
        p.drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)'; // Red glow for X
        
        p.noFill();
        p.stroke(255, 0, 0); // Red color for X tracking
        p.strokeWeight(2);
        p.beginShape();
        for (let d of windowData) {
          const xCoord = p.map(d.time, windowStart, currentTime, 0, canvasWidth);
          // Use expanded range (-10 to 10)
          const yCoord = p.map(d.x, -10, 10, canvasHeight, 0);
          p.vertex(xCoord, yCoord);
        }
        p.endShape();
        
        // Draw the Y position data line with glow effect
        p.drawingContext.shadowBlur = 8;
        p.drawingContext.shadowColor = 'rgba(0, 120, 255, 0.5)'; // Blue glow for Y
        
        p.stroke(0, 120, 255); // Blue color for Y tracking
        p.beginShape();
        for (let d of windowData) {
          const xCoord = p.map(d.time, windowStart, currentTime, 0, canvasWidth);
          // Use expanded range (-10 to 10)
          const yCoord = p.map(d.y, -10, 10, canvasHeight, 0);
          p.vertex(xCoord, yCoord);
        }
        p.endShape();
        
        // Draw the Z position data line
        p.drawingContext.shadowBlur = 8;
        p.drawingContext.shadowColor = 'rgba(255, 120, 0, 0.5)'; // Orange glow for Z
        
        p.stroke(255, 120, 0); // Orange color for Z tracking
        p.beginShape();
        for (let d of windowData) {
          const xCoord = p.map(d.time, windowStart, currentTime, 0, canvasWidth);
          // Use expanded range (-10 to 10)
          const yCoord = p.map(d.z, -10, 10, canvasHeight, 0);
          p.vertex(xCoord, yCoord);
        }
        p.endShape();
        
        // Reset shadow
        p.drawingContext.shadowBlur = 0;
        
        // Add elapsed time at bottom right
        if (windowData.length > 0) {
          const elapsedTime = (currentTime / 1000).toFixed(1);
          
          // Add semi-transparent background for better text legibility at bottom right
          p.fill(26, 180); // #1a1a1a with alpha
          p.rect(canvasWidth - 150, canvasHeight - 30, 140, 25);
          
          p.noStroke();
          p.fill(204); // #cccccc
          p.textAlign(p.RIGHT, p.CENTER);
          p.text(`Elapsed: ${elapsedTime}s`, canvasWidth - 15, canvasHeight - 17);
        }
      };
    }, trackingRef.current);
    
    return () => liveGraphSketch.remove();
  }, [getUnpausedTime, TIME_WINDOW]);

  /***************************************************************************
   * ACCUMULATED TRACKING VISUALIZATION
   ***************************************************************************/
  useEffect(() => {
    let accumulatedSketch = new p5((p) => {
      let canvasWidth, canvasHeight;
      
      p.setup = () => {
        // Get parent div dimensions to ensure we fill the available space
        const parentDiv = accumulatedRef.current.parentElement;
        canvasWidth = parentDiv.clientWidth;
        canvasHeight = parentDiv.clientHeight;
        
        p.createCanvas(canvasWidth, canvasHeight);
        p.textFont('sans-serif');
      };
      
      p.windowResized = () => {
        // Handle window resize to maintain responsive layout
        const parentDiv = accumulatedRef.current.parentElement;
        canvasWidth = parentDiv.clientWidth;
        canvasHeight = parentDiv.clientHeight;
        p.resizeCanvas(canvasWidth, canvasHeight);
      };
      
      p.draw = () => {
        p.background(34); // Using theme background color (#222222)
        
        // Draw grid lines for better readability
        p.stroke(70);
        p.strokeWeight(0.5);
        // Use larger range for y-axis: -10 to 10 instead of -5 to 5
        for (let i = 0; i <= 20; i++) {
          let y = p.map(i, 0, 20, canvasHeight, 0);
          p.line(0, y, canvasWidth, y);
        }
        for (let i = 0; i <= 10; i++) {
          let x = p.map(i, 0, 10, 0, canvasWidth);
          p.line(x, 0, x, canvasHeight);
        }
        
        // Draw axes with improved styling
        p.stroke(204); // #cccccc
        p.strokeWeight(1.5);
        p.line(0, canvasHeight/2, canvasWidth, canvasHeight/2); // X-axis at y=0
        p.line(0, 0, 0, canvasHeight);
        
        p.textSize(14);
        // Updated tick marks for expanded range (-10 to 10)
        const ticks = [-10, -5, 0, 5, 10]; 
        ticks.forEach((tick) => {
          const yPos = p.map(tick, -10, 10, canvasHeight, 0);
          p.stroke(204);
          p.line(0, yPos, 8, yPos);
          p.noStroke();
          p.fill(204); // #cccccc
          p.text(tick, 12, yPos + 5);
        });
        
        // Add axis labels with better positioning
        p.noStroke();
        p.fill(204);
        p.textSize(16);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text('Total Time (s)', canvasWidth - 5, canvasHeight - 5);
        p.textAlign(p.CENTER, p.TOP);
        p.text('Value', 30, 5);

        const data = trackingDataRef.current;
        if (data.length === 0) return;
        
        const currentTime = pausedRef.current
          ? data[data.length - 1].time
          : getUnpausedTime();
          
        // Add time axis labels based on total time
        const totalSeconds = Math.ceil(currentTime / 1000);
        const labelStep = Math.max(1, Math.floor(totalSeconds / 5));
        
        for (let i = 0; i <= totalSeconds; i += labelStep) {
          const xPos = p.map(i * 1000, 0, currentTime, 0, canvasWidth);
          p.noStroke();
          p.fill(204); // #cccccc
          p.textAlign(p.CENTER, p.TOP);
          p.text(i + 's', xPos, canvasHeight - 20);
        }
        
        // Get last data point for current values
        const lastData = data.length > 0 ? data[data.length - 1] : { x: 0, y: 0, z: 0 };
        
        // Add a legend in the top right with current values - using same colors as live tracking
        p.fill(26, 180); // Background for legend
        p.rect(canvasWidth - 120, 10, 110, 70);
        
        p.textAlign(p.LEFT, p.CENTER);
        // X value with color matching live tracking
        p.fill(255, 0, 0); // Red for X (same as live tracking)
        p.text(`X: ${lastData.x.toFixed(2)}`, canvasWidth - 110, 25);
        
        // Y value with color matching live tracking
        p.fill(0, 120, 255); // Blue for Y (same as live tracking)
        p.text(`Y: ${lastData.y.toFixed(2)}`, canvasWidth - 110, 45);
        
        // Z value with color matching live tracking
        p.fill(255, 120, 0); // Orange for Z (same as live tracking)
        p.text(`Z: ${lastData.z.toFixed(2)}`, canvasWidth - 110, 65);
        
        // Draw the X position data line with same colors as live tracking
        p.drawingContext.shadowBlur = 8;
        p.drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)'; // Red glow for X
        
        p.noFill();
        p.stroke(255, 0, 0); // Red for X (same as live tracking)
        p.strokeWeight(2);
        p.beginShape();
        for (let d of data) {
          const xCoord = p.map(d.time, 0, currentTime, 0, canvasWidth);
          // Use expanded range (-10 to 10)
          const yCoord = p.map(d.x, -10, 10, canvasHeight, 0);
          p.vertex(xCoord, yCoord);
        }
        p.endShape();
        
        // Draw the Y position data line
        p.drawingContext.shadowBlur = 8;
        p.drawingContext.shadowColor = 'rgba(0, 120, 255, 0.5)'; // Blue glow for Y
        
        p.stroke(0, 120, 255); // Blue for Y (same as live tracking)
        p.beginShape();
        for (let d of data) {
          const xCoord = p.map(d.time, 0, currentTime, 0, canvasWidth);
          // Use expanded range (-10 to 10)
          const yCoord = p.map(d.y, -10, 10, canvasHeight, 0);
          p.vertex(xCoord, yCoord);
        }
        p.endShape();
        
        // Draw the Z position data line
        p.drawingContext.shadowBlur = 8;
        p.drawingContext.shadowColor = 'rgba(255, 120, 0, 0.5)'; // Orange glow for Z
        
        p.stroke(255, 120, 0); // Orange for Z (same as live tracking)
        p.beginShape();
        for (let d of data) {
          const xCoord = p.map(d.time, 0, currentTime, 0, canvasWidth);
          // Use expanded range (-10 to 10)
          const yCoord = p.map(d.z, -10, 10, canvasHeight, 0);
          p.vertex(xCoord, yCoord);
        }
        p.endShape();
        
        // Reset shadow
        p.drawingContext.shadowBlur = 0;
        
        // Add total time at bottom right
        if (data.length > 0) {
          // Add semi-transparent background for better text legibility at bottom right
          p.fill(26, 180); // #1a1a1a with alpha
          p.rect(canvasWidth - 150, canvasHeight - 30, 140, 25);
          
          p.noStroke();
          p.fill(204); // #cccccc
          p.textAlign(p.RIGHT, p.CENTER);
          p.text(`Total time: ${(currentTime / 1000).toFixed(1)}s`, canvasWidth - 15, canvasHeight - 17);
        }
      };
    }, accumulatedRef.current);
    
    return () => accumulatedSketch.remove();
  }, [getUnpausedTime]);

  return (
    <div className="py-4 bg-background text-text">
      <section className="mb-8 border border-surface-border rounded-lg bg-background-darker" style={{ paddingTop: "0", paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "1rem" }}>
        <h2 className="text-2xl font-bold mb-2 text-text" style={{ marginTop: "0.5rem" }}>Mandelbrot Zoom</h2>
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Text Section */}
          <div className="lg:w-1/2">
            <p className="mb-4 text-text leading-relaxed">
              Ever since childhood, I've been fascinated by the complexity of fractals. The Mandelbrot set was my first introduction to fractals. Simple rules introduce complex and recursive behavior through a feedback loop and result in delightful geometric patterns. You can truly admire its beauty by zooming into fractals, where similar patterns repeat at different scales, having an almost scaleless quality. As a person with aphantasia, programming these elegant equations has made me fall in love with fractals all over again. I hope one day I can afford the time and computer resources to simulate the Mandelbrot's three-dimensional cousin, the Mandelbulb.
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={toggleMandelbrotZoom} 
                className={`px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 ${isShaking ? 'animate-shake' : ''}`}
                disabled={activeViz === 'lorenz' && running}
              >
                {activeViz === 'mandelbrot' ? 'Stop and Reinitialize' : 'Start Zoom'}
              </button>
              <p className="text-text-muted text-xs mt-1">
                Warning: High zoom levels may require significant computing power. Use at your own risk.
              </p>
              {activeViz === 'lorenz' && running && (
                <p className="text-amber-400 text-xs mt-1">
                  Pause the Lorenz visualization to use this feature.
                </p>
              )}
            </div>
          </div>
          {/* Mandelbrot Canvas - Adjusted to properly fit content with no top padding */}
          <div className="lg:w-1/2 border border-surface-border rounded-lg overflow-hidden shadow-lg p-2 bg-background-darker w-full" style={{ height: 'min(380px, 38vh)' }}>
            <div ref={mandelbrotRef} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </section>

      {/* Lorenz Visualizations Section - Renamed to "Visualizing Complexity, Lorenz Attractor" */}
      <section className="border border-surface-border rounded-lg p-4 bg-background-darker">
        <h2 className="text-2xl font-bold mb-3 text-text">Visualizing Complexity, Lorenz Attractor</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* First column: Thoughts on Complexity and Differential Equations */}
          <div className="md:w-1/2">
            {/* Thoughts on Complexity */}
            <div className="border border-surface-border rounded-lg p-4 bg-background shadow-lg mb-4">
              <h3 className="text-lg font-semibold mb-3 text-text-accent">Thoughts on Complexity</h3>
              <div className="text-sm leading-relaxed text-text">
                <p className="mb-3">
                  My exploration of fractals and dynamical systems has instilled a profound interest in nonlinearity and stochasticity. From a scientific and biological perspective, we often linearize variables when observing the environment for the sake of coherency and to derive causal relationships. However, I've come to understand that every interaction is inherently nonlinear.
                </p>
                <p className="mb-3">
                  I view the world as networks of interacting elements, creating a manifold that can be delineated into systems and subsystems. These interact through modularity and modality across various axes of interaction. The Lorenz attractor serves as an excellent example of this complexity - a simplified equation that elegantly demonstrates nonlinearity and stochasticity in action.
                </p>
                <p>
                  This perspective challenges the reductionist approach often used in science, highlighting the importance of considering the intricate, interconnected nature of real-world phenomena. It's a viewpoint that embraces complexity and seeks to understand the world not through isolated variables, but through the rich tapestry of their interactions.
                </p>
              </div>
            </div>
            
            {/* Lorenz equations and start button - in same box as Thoughts but own row */}
            <div className="border border-surface-border rounded-lg p-4 bg-background shadow-lg">
              <h3 className="text-sm font-semibold mb-2 text-text-accent">Lorenz Differential Equations</h3>
              <div className="flex flex-wrap justify-between items-center">
                <div className="flex flex-col space-y-1 mb-2 md:mb-0">
                  <div><span className="font-mono text-xs">dx/dt = σ(y - x)</span></div>
                  <div><span className="font-mono text-xs">dy/dt = x(ρ - z) - y</span></div>
                  <div><span className="font-mono text-xs">dz/dt = xy - βz</span></div>
                  <div className="text-xs text-text-muted">where σ = 10, ρ = 28, β = 8/3</div>
                </div>
                
                <div>
                  <button
                    onClick={toggleRunning}
                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
                    disabled={activeViz === 'mandelbrot'}
                  >
                    {running ? 'Pause' : 'Start'} Lorenz System
                  </button>
                  {activeViz === 'mandelbrot' && (
                    <div className="text-amber-400 text-xs text-center mt-1">
                      Stop the Mandelbrot zoom first.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Second column: Lorenz Attractor 3D */}
          <div className="md:w-1/2 border border-surface-border rounded-lg p-4 bg-background shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-text-accent">Lorenz Attractor (3D)</h3>
            <div
              ref={attractorRef}
              className="border border-surface-border rounded-lg overflow-hidden w-full"
              style={{ height: '350px' }}
            />
          </div>
        </div>
        
        {/* Live Tracking and Accumulated in the same row below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Tracking */}
          <div className="border border-surface-border rounded-lg p-3 bg-background shadow-lg">
            <h3 className="text-md font-semibold mb-2 text-text-accent">Live Tracking</h3>
            <div
              ref={trackingRef}
              className="border border-surface-border rounded-lg overflow-hidden w-full"
              style={{ height: '250px' }}
            />
          </div>
          
          {/* Accumulated */}
          <div className="border border-surface-border rounded-lg p-3 bg-background shadow-lg">
            <h3 className="text-md font-semibold mb-2 text-text-accent">Accumulated</h3>
            <div
              ref={accumulatedRef}
              className="border border-surface-border rounded-lg overflow-hidden w-full"
              style={{ height: '250px' }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default InterestingVisuals;