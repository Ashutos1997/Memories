"use client";

import React, { useState, useRef, useEffect } from "react";

interface CanvasProps {
  children: React.ReactNode;
  zoom: number;
  mode: "select" | "pan" | "draw";
  onOffsetChange?: (offset: { x: number; y: number }) => void;
  onZoomChange?: (zoom: number) => void;
  onDrawComplete?: (points: { x: number; y: number }[]) => void;
  onDrawingDragStart?: (id: string, e: React.PointerEvent) => void;
  externalOffset?: { x: number; y: number };
  drawings?: { id: string; points: { x: number; y: number }[] }[];
  onClick?: () => void;
}

const ARCHIVAL_TRANSITION = "transform 0.7s cubic-bezier(0.65, 0, 0.35, 1)";

export const Canvas: React.FC<CanvasProps> = ({ 
  children, 
  zoom, 
  mode, 
  onOffsetChange, 
  onZoomChange,
  onDrawComplete,
  onDrawingDragStart,
  externalOffset,
  drawings = [],
  onClick
}) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[] | null>(null);
  
  const viewportRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastTouchMidpoint = useRef<{ x: number; y: number } | null>(null);
  const totalMovement = useRef(0);
  
  const currentOffset = useRef({ x: 0, y: 0 });
  const [vSize, setVSize] = useState({ w: 1200, h: 900 });

  useEffect(() => {
    const updateSize = () => setVSize({ w: window.innerWidth, h: window.innerHeight });
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Sync with external offset
  useEffect(() => {
    if (externalOffset && (externalOffset.x !== currentOffset.current.x || externalOffset.y !== currentOffset.current.y)) {
      currentOffset.current = externalOffset;
      setOffset(externalOffset);
    }
  }, [externalOffset]);

  const broadcastOffset = (x: number, y: number) => {
    window.dispatchEvent(new CustomEvent('archival-spatial-update', { 
      detail: { x, y, zoom } 
    }));
  };

  const screenToWorld = (screenX: number, screenY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    return {
      x: (screenX - rect.left - centerX - currentOffset.current.x) / zoom,
      y: (screenY - rect.top - centerY - currentOffset.current.y) / zoom
    };
  };

  // --- NATIVE GESTURE OVERRIDE ---
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.002;
        const newZoom = Math.min(Math.max(zoom + delta, 0.1), 2);
        onZoomChange?.(newZoom);
      } else if (mode === 'pan') {
        e.preventDefault();
        const newX = currentOffset.current.x - e.deltaX;
        const newY = currentOffset.current.y - e.deltaY;
        currentOffset.current = { x: newX, y: newY };
        
        if (containerRef.current) {
          containerRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${zoom})`;
        }
        if (gridRef.current) {
          gridRef.current.style.backgroundPosition = `${newX % (40 * zoom)}px ${newY % (40 * zoom)}px`;
        }
        broadcastOffset(newX, newY);

        if (wheelTimeout.current) clearTimeout(wheelTimeout.current);
        wheelTimeout.current = setTimeout(() => {
          setOffset({ ...currentOffset.current });
          onOffsetChange?.({ ...currentOffset.current });
        }, 150);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastTouchDistance.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        lastTouchMidpoint.current = { x: (touch1.clientX + touch2.clientX) / 2, y: (touch1.clientY + touch2.clientY) / 2 };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        if (lastTouchDistance.current !== null) {
          const delta = (distance - lastTouchDistance.current) * 0.005;
          const newZoom = Math.min(Math.max(zoom + delta, 0.1), 2);
          onZoomChange?.(newZoom);
        }
        lastTouchDistance.current = distance;
        const midX = (touch1.clientX + touch2.clientX) / 2;
        const midY = (touch1.clientY + touch2.clientY) / 2;
        if (lastTouchMidpoint.current) {
          currentOffset.current.x += midX - lastTouchMidpoint.current.x;
          currentOffset.current.y += midY - lastTouchMidpoint.current.y;
          if (containerRef.current) containerRef.current.style.transform = `translate(${currentOffset.current.x}px, ${currentOffset.current.y}px) scale(${zoom})`;
          if (gridRef.current) gridRef.current.style.backgroundPosition = `${currentOffset.current.x % (40 * zoom)}px ${currentOffset.current.y % (40 * zoom)}px`;
          broadcastOffset(currentOffset.current.x, currentOffset.current.y);
        }
        lastTouchMidpoint.current = { x: midX, y: midY };
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
      lastTouchMidpoint.current = null;
      setOffset({ ...currentOffset.current });
      onOffsetChange?.({ ...currentOffset.current });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, mode, onZoomChange, onOffsetChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (mode === "pan") {
      isInteracting.current = true;
      totalMovement.current = 0;
      lastPos.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      if (containerRef.current) containerRef.current.style.transition = "none";
    } else if (mode === "draw") {
      isInteracting.current = true;
      totalMovement.current = 0;
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setCurrentPath([worldPos]);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } else {
      // select mode or others
      isInteracting.current = true;
      totalMovement.current = 0;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isInteracting.current) return;
    
    if (mode === "pan") {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      totalMovement.current += Math.abs(dx) + Math.abs(dy);
      currentOffset.current.x += dx;
      currentOffset.current.y += dy;
      lastPos.current = { x: e.clientX, y: e.clientY };
      if (containerRef.current) containerRef.current.style.transform = `translate(${currentOffset.current.x}px, ${currentOffset.current.y}px) scale(${zoom})`;
      if (gridRef.current) gridRef.current.style.backgroundPosition = `${currentOffset.current.x % (40 * zoom)}px ${currentOffset.current.y % (40 * zoom)}px`;
      broadcastOffset(currentOffset.current.x, currentOffset.current.y);
    } else if (mode === "draw") {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setCurrentPath(prev => prev ? [...prev, worldPos] : [worldPos]);
    } else {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      totalMovement.current += Math.abs(dx) + Math.abs(dy);
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    if (e.pointerId !== undefined) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }

    if (mode === "pan") {
      if (containerRef.current) containerRef.current.style.transition = ARCHIVAL_TRANSITION;
      setOffset({ ...currentOffset.current });
      onOffsetChange?.({ ...currentOffset.current });
    } else if (mode === "draw" && currentPath && currentPath.length > 1) {
      onDrawComplete?.(currentPath);
      setCurrentPath(null);
    }
    
    if (totalMovement.current < 5) {
      onClick?.();
    }
  };

  const renderPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  };

  return (
    <div 
      ref={viewportRef}
      className={`relative w-full h-full overflow-hidden outline-none touch-none ${mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      tabIndex={0}
    >
      <div 
        ref={gridRef}
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${offset.x % (40 * zoom)}px ${offset.y % (40 * zoom)}px`,
        }}
      />

      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center will-change-transform"
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: ARCHIVAL_TRANSITION
        }}
      >
        <div className="relative z-10">
          {children}
        </div>

        {/* Drawing Layer - Centered (0,0) Coordinate System */}
        <svg 
          viewBox={`${-vSize.w/2} ${-vSize.h/2} ${vSize.w} ${vSize.h}`}
          className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-20"
        >
          {drawings.map((draw) => {
            const minX = Math.min(...draw.points.map(p => p.x));
            const maxX = Math.max(...draw.points.map(p => p.x));
            const minY = Math.min(...draw.points.map(p => p.y));
            const maxY = Math.max(...draw.points.map(p => p.y));
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            return (
              <g 
                key={draw.id} 
                className={`group/draw ${mode === 'select' ? 'cursor-grab active:cursor-grabbing pointer-events-auto' : 'pointer-events-none'}`}
                onPointerDown={(e) => {
                  if (mode === 'select') {
                    e.stopPropagation();
                    onDrawingDragStart?.(draw.id, e);
                  }
                }}
              >
                <path
                  d={renderPath(draw.points)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12 / zoom}
                  className="cursor-pointer"
                />
                <path
                  d={renderPath(draw.points)}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth={2 / zoom}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-40 transition-opacity group-hover/draw:opacity-100"
                />
                
                {mode === 'select' && (
                  <foreignObject 
                    x={centerX - (20 / zoom)} 
                    y={centerY - (20 / zoom)} 
                    width={40 / zoom} 
                    height={40 / zoom}
                    className="overflow-visible opacity-0 group-hover/draw:opacity-100 transition-opacity pointer-events-auto"
                  >
                    <div 
                      className="flex items-center justify-center w-full h-full"
                      style={{ transform: `scale(${1 / zoom})`, transformOrigin: 'center' }}
                    >
                      <button
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          window.dispatchEvent(new CustomEvent('archival-delete-drawing', { detail: draw.id })); 
                        }}
                        className="p-1.5 bg-chrome border border-red-500/30 text-red-400 rounded-sm shadow-xl interactive-state hover:bg-red-500/20"
                        title="Delete drawing"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
          {currentPath && (
            <path
              d={renderPath(currentPath)}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={2 / zoom}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
