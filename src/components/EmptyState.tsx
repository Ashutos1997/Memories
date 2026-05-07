import React from "react";
import { Plus, Image as ImageIcon, Microphone } from "@phosphor-icons/react";

interface EmptyStateProps {
  onAction: (action: "note" | "image" | "audio") => void;
  onModeChange: (mode: "select" | "pan" | "draw" | "search") => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAction }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pb-[8vh] md:pb-[12vh] z-10 pointer-events-none overflow-hidden">
      
      {/* Ambient Sanctuary Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-primary/5 rounded-full blur-[80px] md:blur-[120px] animate-sanctuary pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-primary/5 rounded-full blur-[40px] md:blur-[80px] animate-pulse pointer-events-none" />

      <div className="max-w-[540px] w-full flex flex-col items-center gap-8 md:gap-16 animate-sharpen pointer-events-none relative z-10">
        
        {/* Editorial Header Section */}
        <div className="flex flex-col items-center text-center gap-3 md:gap-4">
          <div className="w-8 md:w-12 h-[1px] bg-primary/30 mb-1" />
          <h2 className="text-xl md:text-4xl font-light tracking-tighter text-white/90 leading-tight">
            공간이 비어있습니다.<br/>
            <span className="text-primary/80 font-handwriting">첫 번째 기억을 새겨보세요.</span>
          </h2>
          <p className="text-[14px] md:text-base text-text-muted max-w-[280px] md:max-w-[400px] font-light leading-relaxed break-keep">
            무한한 캔버스 위에 당신의 기록을 자유롭게 배치하고 연결하세요.
          </p>
        </div>

        {/* Staggered Quick Actions */}
        <div className="grid grid-cols-3 gap-2 md:gap-6 w-full max-w-[480px]">
          <button 
            onClick={() => onAction("note")}
            className="flex flex-col md:flex-row items-center gap-2 md:gap-3 p-2 md:p-4 bg-chrome/40 backdrop-blur-md border border-white/5 rounded-lg interactive-state hover:border-primary/40 group pointer-events-auto md:-translate-y-4"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus size={16} className="text-primary md:size-[18px]" weight="bold" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[12px] md:text-[14px] font-bold text-white/90">노트</span>
              <span className="hidden md:block text-[11px] text-text-muted font-mono tracking-wider">텍스트</span>
            </div>
          </button>
          
          <button 
            onClick={() => onAction("image")}
            className="flex flex-col md:flex-row items-center gap-2 md:gap-3 p-2 md:p-4 bg-chrome/40 backdrop-blur-md border border-white/5 rounded-lg interactive-state hover:border-primary/40 group pointer-events-auto md:translate-y-2"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ImageIcon size={16} className="text-primary md:size-[18px]" weight="bold" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[12px] md:text-[14px] font-bold text-white/90">이미지</span>
              <span className="hidden md:block text-[11px] text-text-muted font-mono tracking-wider">비주얼</span>
            </div>
          </button>

          <button 
            onClick={() => onAction("audio")}
            className="flex flex-col md:flex-row items-center gap-2 md:gap-3 p-2 md:p-4 bg-chrome/40 backdrop-blur-md border border-white/5 rounded-lg interactive-state hover:border-primary/40 group pointer-events-auto md:-translate-y-2"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Microphone size={16} className="text-primary md:size-[18px]" weight="bold" />
            </div>
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[12px] md:text-[14px] font-bold text-white/90">음성</span>
              <span className="hidden md:block text-[11px] text-text-muted font-mono tracking-wider">오디오</span>
            </div>
          </button>
        </div>

        {/* Refined Shortcuts Footer */}
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-[12px] font-mono text-text-muted tracking-widest opacity-60">
          <span className="flex items-center gap-2 group"><kbd className="text-primary/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-primary/40 transition-colors">V</kbd> 선택</span>
          <span className="flex items-center gap-2 group"><kbd className="text-primary/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-primary/40 transition-colors">H</kbd> 이동</span>
          <span className="flex items-center gap-2 group"><kbd className="text-primary/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-primary/40 transition-colors">D</kbd> 그리기</span>
          <span className="flex items-center gap-2 group"><kbd className="text-primary/80 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 group-hover:border-primary/40 transition-colors">S</kbd> 검색</span>
        </div>

      </div>
    </div>
  );
};
