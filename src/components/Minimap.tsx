"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface MinimapProps {
  memories: any[];
  offset: { x: number; y: number };
  zoom: number;
}

export const Minimap: React.FC<MinimapProps> = ({ memories, offset, zoom }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [vSize, setVSize] = useState({ w: 1200, h: 900 });

  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 768);
      setVSize({ w: window.innerWidth, h: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Map Dimensions
  const width = isMobile ? 100 : 160;
  const height = isMobile ? 75 : 120;
  
  // World Scale: How many minimap pixels per 1 world pixel (at zoom 1.0)
  // We want the default world area (approx 2000px) to fit nicely.
  const worldScale = isMobile ? 0.04 : 0.05;

  const indicatorRef = useRef<HTMLDivElement>(null);

  /**
   * Spatial Projection Logic:
   * 1. The Canvas uses 'transform: translate(offX, offY) scale(zoom)' with 'center center' origin.
   * 2. This means the world coordinate at the screen center is (-offX / zoom, -offY / zoom).
   * 3. The visible world width is (viewportWidth / zoom).
   */
  const calculatePos = useCallback((offX: number, offY: number, curZoom: number) => {
    // World coordinates of the viewport center
    const centerX = -offX / curZoom;
    const centerY = -offY / curZoom;

    // Map coordinates (Relative to Minimap center)
    const mapX = (width / 2) + (centerX * worldScale);
    const mapY = (height / 2) + (centerY * worldScale);

    // Indicator dimensions in map pixels
    const indicatorW = (vSize.w * worldScale) / curZoom;
    const indicatorH = (vSize.h * worldScale) / curZoom;

    return { 
      x: mapX, 
      y: mapY, 
      w: Math.max(indicatorW, 4), 
      h: Math.max(indicatorH, 4) 
    };
  }, [width, height, worldScale, vSize]);

  // Real-time listener for Canvas broadcasts
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const { x, y, zoom: curZoom } = e.detail;
      if (indicatorRef.current) {
        const pos = calculatePos(x, y, curZoom);
        indicatorRef.current.style.left = `${pos.x}px`;
        indicatorRef.current.style.top = `${pos.y}px`;
        indicatorRef.current.style.width = `${pos.w}px`;
        indicatorRef.current.style.height = `${pos.h}px`;
      }
    };

    window.addEventListener('archival-spatial-update', handleUpdate);
    return () => window.removeEventListener('archival-spatial-update', handleUpdate);
  }, [calculatePos]);

  const initialPos = calculatePos(offset.x, offset.y, zoom);

  return (
    <aside className="fixed top-4 md:top-auto md:bottom-8 left-4 md:left-auto md:right-8 z-[200]">
      <div 
        className="border border-border-subtle shadow-[0_20px_50px_rgba(0,0,0,1)] rounded-lg bg-black overflow-hidden relative transition-all duration-300"
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 border-t border-l border-white/5 pointer-events-none" />

        {/* Viewport Indicator - The Golden Rectangle */}
        <div 
          ref={indicatorRef}
          className="absolute border border-primary/40 bg-primary/[0.04] pointer-events-none transition-[left,top,width,height] duration-75 ease-out"
          style={{
            width: initialPos.w,
            height: initialPos.h,
            left: initialPos.x,
            top: initialPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Corner Brackets for Archival Feel */}
          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-primary/80" />
          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-primary/80" />
          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-primary/80" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-primary/80" />
        </div>

        {/* Memory Fragments (Map dots) */}
        {memories.map((memory) => (
          <div 
            key={memory.id}
            className="absolute rounded-full bg-primary shadow-[0_0_4px_hsla(38, 42%, 61%, 0.4)] transition-all duration-700"
            style={{
              width: 2,
              height: 2,
              left: (width / 2) + (memory.x * worldScale),
              top: (height / 2) + (memory.y * worldScale),
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </aside>
  );
};
