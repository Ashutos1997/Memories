import React from "react";
import { 
  CursorClick, 
  HandPalm, 
  PencilLine, 
  MagnifyingGlass, 
  PlusMinus, 
  Plus,
  Image as ImageIcon,
  Microphone
} from "@phosphor-icons/react";

interface EmptyStateProps {
  onAction: (action: "note" | "image" | "audio") => void;
  onModeChange: (mode: "select" | "pan" | "draw" | "search") => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onAction, onModeChange }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 overflow-y-auto pointer-events-none">
      <div className="max-w-[640px] w-full flex flex-col items-center gap-12 animate-[fadeIn_1s_ease-out] pointer-events-auto">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-2">
            <Plus size={24} className="text-primary" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              아카이브를 시작하세요
            </h2>
            <p className="text-sm md:text-base text-text-muted max-w-[400px]">
              기억을 공간에 배치하고 자유롭게 탐색해보세요.<br />
              아래 단축키나 버튼을 눌러 첫 기록을 남길 수 있습니다.
            </p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <button 
            onClick={() => onAction("note")}
            className="flex flex-col items-center gap-4 p-6 bg-chrome border border-border-subtle rounded-xl interactive-state hover:border-primary/40 group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus size={20} className="text-text-muted group-hover:text-primary" />
            </div>
            <span className="text-sm font-bold">새 노트 작성</span>
          </button>
          
          <button 
            onClick={() => onAction("image")}
            className="flex flex-col items-center gap-4 p-6 bg-chrome border border-border-subtle rounded-xl interactive-state hover:border-primary/40 group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <ImageIcon size={20} className="text-text-muted group-hover:text-primary" />
            </div>
            <span className="text-sm font-bold">이미지 업로드</span>
          </button>

          <button 
            onClick={() => onAction("audio")}
            className="flex flex-col items-center gap-4 p-6 bg-chrome border border-border-subtle rounded-xl interactive-state hover:border-primary/40 group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Microphone size={20} className="text-text-muted group-hover:text-primary" />
            </div>
            <span className="text-sm font-bold">음성 기록</span>
          </button>
        </div>

        {/* Shortcuts Section */}
        <div className="w-full pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <kbd className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded text-[12px] font-mono font-bold text-primary">V</kbd>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">선택 모드</span>
                <CursorClick size={14} className="text-white/20" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded text-[12px] font-mono font-bold text-primary">H</kbd>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">이동 모드</span>
                <HandPalm size={14} className="text-white/20" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded text-[12px] font-mono font-bold text-primary">D</kbd>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">드로잉 모드</span>
                <PencilLine size={14} className="text-white/20" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded text-[12px] font-mono font-bold text-primary">S</kbd>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">저장소 검색</span>
                <MagnifyingGlass size={14} className="text-white/20" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-2 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded text-[12px] font-mono font-bold text-primary">+/-</kbd>
              <div className="flex flex-col">
                <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">확대/축소</span>
                <PlusMinus size={14} className="text-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
          <p className="text-[11px] md:text-[12px] text-primary/80 font-medium">
            💡 팁: 이미지를 화면 어디든 드래그하여 바로 추가할 수 있습니다.
          </p>
        </div>

      </div>
    </div>
  );
};
