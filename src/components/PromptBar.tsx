import React, { useState, useRef, useEffect } from "react";
import { Plus, CursorClick, HandPalm, MagnifyingGlass, Stop, Notebook, PencilLine, ArrowCounterClockwise, X } from "@phosphor-icons/react";
import { AttachmentPopup } from "./AttachmentPopup";
import { InteractionMode } from "../types";

interface PromptBarProps {
  onSubmit: (prompt: string, tag?: string) => Promise<void> | void;
  onUpload?: (file: File, prompt?: string, tag?: string) => Promise<void> | void;
  onSearch?: (query: string) => void;
  onScrapbook?: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  activeTemplate: string;
  externalAction?: { type: 'note' | 'image' | 'audio'; timestamp: number } | null;
  existingTags?: string[];
}

export const PromptBar: React.FC<PromptBarProps> = ({ onSubmit, onUpload, onSearch, onScrapbook, onReset, isLoading, mode, onModeChange, activeTemplate, externalAction, existingTags = [] }) => {
  const [value, setValue] = useState("");
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [statusIndicator, setStatusIndicator] = useState<{ message: string; type: 'info' | 'error' | 'success' } | null>(null);
  
  // Tag Flow States
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagValue, setTagValue] = useState("");
  const [tagExists, setTagExists] = useState(false);
  const [pendingContent, setPendingContent] = useState<{
    type: 'text' | 'image' | 'audio';
    value?: string;
    file?: File;
  } | null>(null);

  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);

  // Sync ref with state
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (mode === 'search') {
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      // Clear search value when returning to select/pan mode
      setValue("");
    }
  }, [mode]);

  useEffect(() => {
    if (externalAction) {
      if (externalAction.type === 'note') {
        onModeChange('select');
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if (externalAction.type === 'image') {
        onModeChange('select');
        setShowAttachmentPopup(true);
      } else if (externalAction.type === 'audio') {
        onModeChange('select');
        setShowAttachmentPopup(true);
      }
    }
  }, [externalAction]);

  // History Support for Popup
  useEffect(() => {
    const handlePopState = () => {
      if (showAttachmentPopup) setShowAttachmentPopup(false);
      if (showTagInput) {
        setShowTagInput(false);
        setPendingContent(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (showAttachmentPopup || showTagInput) window.history.pushState({ popup: true }, "");
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showAttachmentPopup, showTagInput]);

  // Escape Support for Popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAttachmentPopup) setShowAttachmentPopup(false);
        if (showTagInput) {
          setShowTagInput(false);
          setPendingContent(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAttachmentPopup, showTagInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    if (mode === 'search') {
      onSearch?.(value);
    } else if (!isLoading) {
      setPendingContent({ type: 'text', value });
      setShowTagInput(true);
      setTagValue("");
      setTagExists(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setPendingContent({ type: 'image', file, value });
    setShowTagInput(true);
    setTagValue("");
    setTagExists(false);
    setShowAttachmentPopup(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        
        setPendingContent({ type: 'audio', file, value: valueRef.current });
        setShowTagInput(true);
        setTagValue("");
        setTagExists(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setShowAttachmentPopup(false);
    } catch (err) {
      console.error("Recording error:", err);
      setStatusIndicator({ message: "마이크 접근 권한이 필요합니다.", type: 'error' });
      setTimeout(() => setStatusIndicator(null), 3000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceRecord = () => {
    startRecording();
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingContent || tagExists || !tagValue.trim()) return;

    const finalTag = tagValue.trim();
    const content = pendingContent; // Capture to avoid race conditions
    
    // Clear UI state immediately for better UX
    setShowTagInput(false);
    setTagValue("");
    setTagExists(false);
    setPendingContent(null);
    setValue("");

    if (content.type === 'text') {
      await onSubmit(content.value || "", finalTag);
    } else if (content.file) {
      await onUpload?.(content.file, content.value, finalTag);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 md:bottom-[32px] left-1/2 -translate-x-1/2 w-full max-w-[840px] z-[200] px-3 md:px-6">
        
        {/* Tag Input Popup */}
        {showTagInput && (
          <div className="absolute bottom-full left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 mb-4 md:mb-6 w-auto md:w-[320px] bg-chrome/95 backdrop-blur-2xl border border-primary/40 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 md:p-5 animate-[fadeIn_0.2s_ease-out] z-[500]">
            <form onSubmit={handleTagSubmit} className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tag-input" className="text-[10px] md:text-[11px] font-mono font-bold text-primary tracking-[0.2em] uppercase opacity-70">
                  기억 분류 태그 (최대 14자)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-primary/50 font-mono font-bold text-[14px] md:text-[16px]">#</span>
                  <input
                    id="tag-input"
                    autoFocus
                    type="text"
                    value={tagValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s+/g, '').slice(0, 14);
                      setTagValue(val);
                      setTagExists(existingTags.some(t => t?.toLowerCase() === val.toLowerCase()));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !tagExists && tagValue.trim()) {
                        e.preventDefault();
                        handleTagSubmit(e as any);
                      }
                    }}
                    placeholder="TAG..."
                    className={`w-full bg-white/5 border rounded-md py-2 md:py-3 pl-8 pr-4 text-white font-mono font-bold text-[14px] md:text-[16px] focus:outline-none transition-colors placeholder:text-white/20 ${tagExists ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary/50'}`}
                  />
                </div>
                {tagExists && (
                  <span className="text-[10px] md:text-[11px] text-red-400 font-medium animate-[fadeIn_0.2s_ease-out]">
                    이미 사용 중인 태그입니다.
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!tagValue.trim() || tagExists}
                className="w-full bg-primary text-primary-foreground py-2 md:py-3 rounded-md font-bold text-[12px] md:text-[14px] tracking-widest uppercase interactive-state shadow-lg border border-transparent disabled:bg-white/5 disabled:text-white/20 disabled:border-white/10 disabled:shadow-none"
              >
                저장 완료 (ENTER)
              </button>
              <button
                type="button"
                onClick={() => { setShowTagInput(false); setPendingContent(null); }}
                className="w-full py-2 md:py-3 rounded-md border border-border-subtle bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 interactive-state font-bold text-[10px] md:text-[12px] tracking-[0.2em] uppercase"
              >
                취소
              </button>
            </form>
          </div>
        )}

        {isRecording ? (
          <div className="flex items-center justify-between bg-[#121214] border border-accent/40 rounded-[16px] p-2 md:p-3 shadow-2xl h-[48px] md:h-[64px] animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center gap-3 px-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-white text-[14px] md:text-[16px] font-mono font-bold tracking-tight">{formatTime(recordingTime)}</span>
              <span className="text-white/40 text-[12px] ml-2 hidden md:inline font-medium tracking-wide">녹음 진행 중...</span>
            </div>
            <button 
              onClick={stopRecording}
              className="bg-primary text-primary-foreground px-4 md:px-6 py-1.5 md:py-2 rounded-md font-bold text-[12px] md:text-[14px] interactive-state shadow-lg"
            >
              완료
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
            
            {/* Desktop Mode Toggles */}
            <div 
              className="hidden md:flex items-center gap-2 md:gap-3 p-2 bg-chrome border border-border-subtle rounded-lg shadow-2xl h-[64px]"
              role="radiogroup"
              aria-label="Interaction mode"
            >
              <div className="relative group/tooltip">
                <button
                  type="button"
                  onClick={() => onModeChange("select")}
                  className={`w-11 h-11 rounded-md flex items-center justify-center interactive-state ${mode === 'select' ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
                  aria-checked={mode === "select"}
                  aria-label="Selection mode (V)"
                  role="radio"
                >
                  <CursorClick size={22} weight={mode === 'select' ? 'fill' : 'bold'} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-chrome border border-border-subtle rounded-md text-[12px] font-mono text-primary whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 z-[500] shadow-xl">
                  선택 모드 (V)
                </div>
              </div>

              <div className="relative group/tooltip">
                <button
                  type="button"
                  onClick={() => onModeChange("pan")}
                  className={`w-11 h-11 rounded-md flex items-center justify-center interactive-state ${mode === 'pan' ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
                  aria-checked={mode === "pan"}
                  aria-label="Pan mode (H)"
                  role="radio"
                >
                  <HandPalm size={22} weight={mode === 'pan' ? 'fill' : 'bold'} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-chrome border border-border-subtle rounded-md text-[12px] font-mono text-primary whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 z-[500] shadow-xl">
                  이동 모드 (H)
                </div>
              </div>

              <div className="relative group/tooltip">
                <button
                  type="button"
                  onClick={() => onModeChange("draw")}
                  className={`w-11 h-11 rounded-md flex items-center justify-center interactive-state ${mode === 'draw' ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
                  aria-checked={mode === "draw"}
                  aria-label="Draw mode (D)"
                  role="radio"
                >
                  <PencilLine size={22} weight={mode === 'draw' ? 'fill' : 'bold'} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-chrome border border-border-subtle rounded-md text-[12px] font-mono text-primary whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 z-[500] shadow-xl">
                  드로잉 모드 (D)
                </div>
              </div>

              <div className="relative group/tooltip">
                <button
                  type="button"
                  onClick={onScrapbook}
                  className={`w-11 h-11 rounded-md flex items-center justify-center interactive-state text-text-muted hover:text-text-primary hover:bg-white/5 ${activeTemplate === 'scrapbook' ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' : ''}`}
                  aria-label="Scrapbook layout"
                >
                  <Notebook size={22} weight={activeTemplate === 'scrapbook' ? 'fill' : 'bold'} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-chrome border border-border-subtle rounded-md text-[12px] font-mono text-primary whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 z-[500] shadow-xl">
                  스크랩북 모드
                </div>
              </div>

              {activeTemplate !== 'default' && (
                <div className="relative group/tooltip">
                  <button
                    type="button"
                    onClick={onReset}
                    className="w-11 h-11 rounded-md flex items-center justify-center interactive-state text-text-muted hover:text-text-primary hover:bg-white/5 animate-[fadeIn_0.3s_ease-out]"
                  >
                    <ArrowCounterClockwise size={22} weight="bold" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-chrome border border-border-subtle rounded-md text-[12px] font-mono text-primary whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 z-[500] shadow-xl">
                    레이아웃 초기화 (U)
                  </div>
                </div>
              )}
              <div className="w-[1px] h-4 bg-border-subtle mx-1" />
              <div className="relative group/tooltip">
                <button
                  type="button"
                  onClick={() => onModeChange("search")}
                  className={`w-11 h-11 rounded-md flex items-center justify-center interactive-state ${mode === 'search' ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
                  aria-checked={mode === 'search'}
                  aria-label="Search archive (S)"
                  role="radio"
                >
                  <MagnifyingGlass size={22} weight={mode === 'search' ? 'fill' : 'bold'} />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-chrome border border-border-subtle rounded-md text-[12px] font-mono text-primary whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover/tooltip:translate-y-0 z-[500] shadow-xl">
                  저장소 검색 / 태그 (#tag) (S)
                </div>
              </div>
            </div>

            {/* Mobile Mode Toggles */}
            <div className="md:hidden flex items-center gap-1.5 bg-chrome border border-border-subtle rounded-lg p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => onModeChange("select")}
                className={`w-[40px] h-[40px] rounded-md flex items-center justify-center transition-all ${mode === 'select' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                aria-label="Selection mode"
              >
                <CursorClick size={18} weight={mode === 'select' ? 'fill' : 'bold'} />
              </button>

              <div className="w-[1px] h-3 bg-border-subtle mx-0.5" />

              <button
                type="button"
                onClick={() => onModeChange("pan")}
                className={`w-[40px] h-[40px] rounded-md flex items-center justify-center transition-all ${mode === 'pan' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                aria-label="Pan mode"
              >
                <HandPalm size={18} weight={mode === 'pan' ? 'fill' : 'bold'} />
              </button>
              <div className="w-[1px] h-3 bg-border-subtle mx-0.5" />
              <button
                type="button"
                onClick={() => onModeChange(mode === 'search' ? 'select' : 'search')}
                className={`w-[40px] h-[40px] rounded-md flex items-center justify-center transition-all ${mode === 'search' ? 'bg-primary text-primary-foreground' : 'text-text-muted'}`}
                aria-label="Search mode"
              >
                <MagnifyingGlass size={18} weight={mode === 'search' ? 'fill' : 'bold'} />
              </button>
              
              <div className="w-[1px] h-3 bg-border-subtle mx-0.5" />

              <button
                type="button"
                onClick={() => onModeChange("draw")}
                className={`w-[40px] h-[40px] rounded-md flex items-center justify-center transition-all ${mode === 'draw' ? 'bg-primary text-primary-foreground' : 'text-text-muted'}`}
                aria-label="Draw mode"
              >
                <PencilLine size={18} weight={mode === 'draw' ? 'fill' : 'bold'} />
              </button>

              <div className="w-[1px] h-3 bg-border-subtle mx-0.5" />

              <button
                type="button"
                onClick={onScrapbook}
                className={`w-[40px] h-[40px] rounded-md flex items-center justify-center transition-all ${activeTemplate === 'scrapbook' ? 'bg-primary/20 text-primary border border-primary/20 shadow-inner' : 'text-text-muted'}`}
                aria-label="Scrapbook mode"
              >
                <Notebook size={18} weight={activeTemplate === 'scrapbook' ? 'fill' : 'bold'} />
              </button>

              {activeTemplate !== 'default' && (
                <button
                  type="button"
                  onClick={onReset}
                  className="w-[40px] h-[40px] rounded-md flex items-center justify-center text-text-muted animate-[fadeIn_0.3s_ease-out]"
                  aria-label="Reset layout"
                >
                  <ArrowCounterClockwise size={18} weight="bold" />
                </button>
              )}
            </div>

            <form 
              onSubmit={handleSubmit}
              className={`flex-1 group relative flex items-center bg-chrome border rounded-lg p-1.5 md:p-2 shadow-2xl h-[48px] md:h-[64px] transition-all duration-300 ${mode === 'search' ? 'border-border focus-within:border-primary/40' : 'border-border-subtle focus-within:border-primary/40'}`}
            >
              {mode !== 'search' && (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAttachmentPopup(!showAttachmentPopup)}
                      className={`flex items-center justify-center w-8 h-8 md:w-11 md:h-11 rounded-md border transition-all duration-200 group/upload ${showAttachmentPopup ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border-subtle bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 hover:border-primary/40'}`}
                      aria-label="Add attachment"
                      aria-expanded={showAttachmentPopup}
                    >
                      <Plus weight="bold" className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>

                  <AttachmentPopup
                    isOpen={showAttachmentPopup}
                    onClose={() => setShowAttachmentPopup(false)}
                    onImageSelect={handleImageSelect}
                    onVoiceRecord={handleVoiceRecord}
                  />
                </>
              )}
              
              {mode === 'search' && (
                <button
                  type="button"
                  onClick={() => onModeChange('select')}
                  className="flex items-center justify-center w-8 h-8 md:w-11 md:h-11 rounded-md border border-border-subtle bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 interactive-state mr-2 shrink-0"
                  aria-label="Exit search"
                >
                  <ArrowCounterClockwise weight="bold" className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

              {mode === 'search' && value && (
                <div className="absolute left-[52px] md:left-[56px] top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none animate-[fadeIn_0.2s_ease-out] z-10">
                  <div className="bg-primary/20 border border-primary/40 text-primary text-[8px] md:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-widest flex items-center gap-1 md:gap-1.5 shadow-sm whitespace-nowrap">
                    <MagnifyingGlass size={10} weight="bold" />
                    <span className="hidden xs:inline">필터링 중</span>
                    <span className="xs:hidden">FILTER</span>
                  </div>
                </div>
              )}


              
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={mode === 'search' ? "기억 검색 (예: #여행 또는 ID)" : "기억 기록... (#태그 추가)"}
                className={`flex-1 bg-transparent border-none outline-none py-1.5 md:py-3 px-2 md:px-4 transition-all duration-500 text-[14px] md:text-base tracking-tight ${mode === 'search' ? 'text-white placeholder:text-white/60' : 'text-white placeholder:text-white/50'} ${mode === 'search' && value ? 'pl-[64px] md:pl-[90px]' : ''}`}
                aria-label={mode === 'search' ? "기억 검색" : "기억 기록"}
                disabled={isLoading && mode !== 'search'}
              />

              {mode === 'search' && value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    onSearch?.("");
                    inputRef.current?.focus();
                  }}
                  className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all mr-2"
                  aria-label="Clear search"
                >
                  <X size={16} weight="bold" />
                </button>
              )}
              
              <button
                type="submit"
                disabled={!value.trim() || (isLoading && mode !== 'search')}
                className={`relative overflow-hidden px-3 md:px-6 py-1.5 md:py-2.5 rounded-md interactive-state font-bold flex items-center gap-2 text-[12px] md:text-sm bg-primary text-primary-foreground h-full md:h-auto border border-transparent disabled:bg-white/5 disabled:text-white/20 disabled:border-white/10 disabled:shadow-none`}
              >
                {isLoading && mode !== 'search' && <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-primary-foreground rounded-full animate-spin" />}
                <span>{mode === 'search' ? '검색' : '기억'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Status Indicator */}
        {statusIndicator && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#1a1a1c] border border-white/10 rounded-[8px] text-center z-50 animate-[fadeIn_0.2s_ease-out]">
            <span className={
              statusIndicator.type === 'success' ? 'text-green-400' :
              statusIndicator.type === 'error' ? 'text-red-400' :
              'text-blue-400'
            }>
              {statusIndicator.message}
            </span>
          </div>
        )}
      </div>
    </>
  );
};
