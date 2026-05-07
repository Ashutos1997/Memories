import React from "react";
import { Plus, Image as ImageIcon, Microphone } from "@phosphor-icons/react";

interface EmptyStateProps {
  onAction: (action: "note" | "image" | "audio") => void;
  onModeChange: (mode: "select" | "pan" | "draw" | "search") => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAction }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 pointer-events-none">
      <div className="max-w-[480px] w-full flex flex-col items-center gap-10 animate-[fadeIn_0.8s_ease-out] pointer-events-none">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            아카이브를 시작하세요
          </h2>
          <p className="text-sm text-text-muted">
            기억을 공간에 자유롭게 배치하고 기록하세요.
          </p>
        </div>

        {/* Quick Actions - Simplified Horizontal */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button 
            onClick={() => onAction("note")}
            className="flex flex-1 items-center justify-center gap-2 py-4 bg-chrome border border-border-subtle rounded-lg interactive-state hover:border-primary/40 group pointer-events-auto"
          >
            <Plus size={18} className="text-primary" />
            <span className="text-sm font-bold">새 노트</span>
          </button>
          
          <button 
            onClick={() => onAction("image")}
            className="flex flex-1 items-center justify-center gap-2 py-4 bg-chrome border border-border-subtle rounded-lg interactive-state hover:border-primary/40 group pointer-events-auto"
          >
            <ImageIcon size={18} className="text-primary" />
            <span className="text-sm font-bold">이미지</span>
          </button>

          <button 
            onClick={() => onAction("audio")}
            className="flex flex-1 items-center justify-center gap-2 py-4 bg-chrome border border-border-subtle rounded-lg interactive-state hover:border-primary/40 group pointer-events-auto"
          >
            <Microphone size={18} className="text-primary" />
            <span className="text-sm font-bold">음성</span>
          </button>
        </div>

        {/* Minimal Shortcuts Footer */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-text-muted/60 tracking-wider">
          <span className="flex items-center gap-1.5"><kbd className="text-primary">V</kbd> 선택</span>
          <span className="flex items-center gap-1.5"><kbd className="text-primary">H</kbd> 이동</span>
          <span className="flex items-center gap-1.5"><kbd className="text-primary">D</kbd> 그리기</span>
          <span className="flex items-center gap-1.5"><kbd className="text-primary">S</kbd> 검색</span>
        </div>

      </div>
    </div>
  );
};
