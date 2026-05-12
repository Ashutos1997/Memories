import React from "react";
import { Plus, Image as ImageIcon, Microphone } from "@phosphor-icons/react";

interface EmptyStateProps {
  onAction: (action: "note" | "image" | "audio") => void;
  onModeChange: (mode: "select" | "pan" | "draw" | "search") => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAction }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pb-[8vh] md:pb-[12vh] z-10 pointer-events-none overflow-hidden">
      
      {/* Ambient Sanctuary Pulse - Triple Layer Depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-primary/10 rounded-full blur-[100px] md:blur-[160px] animate-sanctuary pointer-events-none opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-primary/5 rounded-full blur-[60px] md:blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] md:w-[200px] md:h-[200px] bg-white/5 rounded-full blur-[40px] md:blur-[60px] animate-ghost pointer-events-none" />

      <div className="max-w-[540px] w-full flex flex-col items-center gap-8 md:gap-16 animate-sharpen pointer-events-none relative z-10">
        
        {/* Editorial Header Section */}
        <div className="flex flex-col items-center text-center gap-2 md:gap-3">
          <div className="w-8 md:w-12 h-[1px] bg-primary/20 mb-1" />
          <h2 className="text-xl md:text-4xl font-handwriting text-primary/80 leading-tight tracking-tight">
            첫 번째 기록을 새겨보세요.
          </h2>
        </div>

        {/* Staggered Quick Actions */}
        <div className="grid grid-cols-3 gap-3 md:gap-8 w-full max-w-[520px]">
          <button 
            onClick={() => onAction("note")}
            className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-5 bg-chrome/60 backdrop-blur-2xl border border-white/5 rounded-xl interactive-state hover:border-primary/50 group pointer-events-auto md:-translate-y-6 shadow-2xl"
          >
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
              <Plus size={20} className="text-primary md:size-[24px]" weight="bold" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[13px] md:text-[15px] font-bold text-white tracking-tight">노트</span>
              <span className="hidden md:block text-[11px] text-text-muted font-mono tracking-[0.2em] uppercase mt-0.5">TEXT</span>
            </div>
          </button>
          
          <button 
            onClick={() => onAction("image")}
            className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-5 bg-chrome/60 backdrop-blur-2xl border border-white/5 rounded-xl interactive-state hover:border-primary/50 group pointer-events-auto md:translate-y-4 shadow-2xl"
          >
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
              <ImageIcon size={20} className="text-primary md:size-[24px]" weight="bold" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[13px] md:text-[15px] font-bold text-white tracking-tight">이미지</span>
              <span className="hidden md:block text-[11px] text-text-muted font-mono tracking-[0.2em] uppercase mt-0.5">IMAGE</span>
            </div>
          </button>
          
          <button 
            onClick={() => onAction("audio")}
            className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-5 bg-chrome/60 backdrop-blur-2xl border border-white/5 rounded-xl interactive-state hover:border-primary/50 group pointer-events-auto md:-translate-y-2 shadow-2xl"
          >
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
              <Microphone size={20} className="text-primary md:size-[24px]" weight="bold" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[13px] md:text-[15px] font-bold text-white tracking-tight">음성</span>
              <span className="hidden md:block text-[11px] text-text-muted font-mono tracking-[0.2em] uppercase mt-0.5">AUDIO</span>
            </div>
          </button>
        </div>

        {/* Refined Shortcuts Footer */}
        <div className="hidden md:flex flex-wrap justify-center items-center gap-8 text-[11px] font-mono text-text-muted tracking-[0.3em] uppercase opacity-60">
          <span className="flex items-center gap-3 group transition-all duration-300 hover:opacity-100">
            <kbd className="text-primary bg-white/5 px-2 py-1 rounded-md border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 shadow-lg">V</kbd> 
            <span className="font-bold">선택</span>
          </span>
          <span className="flex items-center gap-3 group transition-all duration-300 hover:opacity-100">
            <kbd className="text-primary bg-white/5 px-2 py-1 rounded-md border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 shadow-lg">H</kbd> 
            <span className="font-bold">이동</span>
          </span>
          <span className="flex items-center gap-3 group transition-all duration-300 hover:opacity-100">
            <kbd className="text-primary bg-white/5 px-2 py-1 rounded-md border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 shadow-lg">D</kbd> 
            <span className="font-bold">그리기</span>
          </span>
          <span className="flex items-center gap-3 group transition-all duration-300 hover:opacity-100">
            <kbd className="text-primary bg-white/5 px-2 py-1 rounded-md border border-white/10 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-300 shadow-lg">S</kbd> 
            <span className="font-bold">검색</span>
          </span>
        </div>

      </div>
    </div>
  );
};
