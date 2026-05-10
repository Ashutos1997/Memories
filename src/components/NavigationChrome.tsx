"use client";

import React from "react";
import { Plus, Minus, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface NavigationChromeProps {
  memories: any[];
  zoom: number;
  offset: { x: number; y: number };
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrevMemory: () => void;
  onNextMemory: () => void;
}

export const NavigationChrome: React.FC<NavigationChromeProps> = ({ memories, zoom, onZoomIn, onZoomOut, onPrevMemory, onNextMemory }) => {
  return (
    <nav className="fixed top-4 md:top-8 right-4 md:right-8 z-[200]">
      <div className="flex items-center gap-2 p-1 bg-chrome border border-border-subtle rounded-lg shadow-2xl h-[40px] md:h-[56px]">
        {/* Memory Navigation */}
        <div className="flex items-center gap-0.5 md:gap-1 pl-1">
          <button 
            onClick={onPrevMemory}
            disabled={memories.length <= 1}
            className="w-7 h-7 md:w-10 md:h-10 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none interactive-state"
            aria-label="Previous memory"
            title="이전 기억 (Chronological Back)"
          >
            <CaretLeft className="w-3.5 h-3.5 md:w-5 md:h-5" weight="bold" />
          </button>
          
          <div className="px-1 md:px-2 min-w-[32px] md:min-w-[48px] text-center border-x border-border-subtle/50 h-4 flex items-center justify-center">
            <span className="text-[12px] font-mono text-primary font-bold tracking-tighter">
              {memories.length}
            </span>
          </div>

          <button 
            onClick={onNextMemory}
            disabled={memories.length <= 1}
            className="w-7 h-7 md:w-10 md:h-10 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 disabled:opacity-20 disabled:pointer-events-none interactive-state"
            aria-label="Next memory"
            title="다음 기억"
          >
            <CaretRight className="w-3.5 h-3.5 md:w-5 md:h-5" weight="bold" />
          </button>
        </div>

        <div className="w-[1px] h-3 md:h-4 bg-border-subtle" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 md:gap-1 pr-1">
          <button 
            onClick={onZoomOut}
            className="w-7 h-7 md:w-10 md:h-10 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 interactive-state"
            aria-label="Zoom out (-)"
            title="축소 (-)"
          >
            <Minus className="w-3.5 h-3.5 md:w-4 md:h-4" weight="bold" />
          </button>
          
          <div className="px-1 md:px-2 min-w-[32px] md:min-w-[48px] text-center">
            <span className="text-[12px] font-mono text-text-muted font-bold">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button 
            onClick={onZoomIn}
            className="w-7 h-7 md:w-10 md:h-10 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 interactive-state"
            aria-label="Zoom in (+)"
            title="확대 (+)"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" weight="bold" />
          </button>
        </div>
      </div>
    </nav>
  );
};
