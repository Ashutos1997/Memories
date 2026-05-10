"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image, Microphone } from "@phosphor-icons/react";

interface AttachmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (file: File) => void;
  onVoiceRecord: () => void;
}

interface StatusMessage {
  message: string;
  type: 'info' | 'error' | 'success';
}

export const AttachmentPopup: React.FC<AttachmentPopupProps> = ({
  isOpen,
  onClose,
  onImageSelect,
  onVoiceRecord,
}) => {
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      onClose();
    }
  };

  return (
    <div 
      ref={popupRef}
      className="absolute bottom-full left-0 mb-2 md:mb-6 z-[300] w-[260px] bg-chrome/90 backdrop-blur-xl border border-border rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 animate-[fadeIn_0.2s_ease-out] origin-bottom-left"
    >
      {/* Status Indicator */}
      {status && (
        <div className="absolute -top-12 left-0 right-0 px-3 py-2 bg-chrome border border-border-subtle rounded-md text-center z-50 animate-[fadeIn_0.2s_ease-out]">
          <span className={
            status.type === 'success' ? 'text-green-400' :
            status.type === 'error' ? 'text-red-400' :
            'text-primary'
          }>
            {status.message}
          </span>
        </div>
      )}

      {/* Options List */}
      <div className="flex flex-col gap-1">
        {/* Image Option */}
        <label className="flex items-center gap-3 p-2 rounded-sm hover:bg-white/10 cursor-pointer group border border-transparent hover:border-border-subtle transition-all duration-200">
          <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Image size={18} className="text-primary" weight="bold" />
          </div>
          <div className="flex-1">
            <div className="text-text-primary text-[13px] font-semibold leading-tight">이미지</div>
            <div className="text-text-muted text-[12px] mt-0.5">사진이나 이미지 업로드</div>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>

        {/* Voice Option */}
        <button
          type="button"
          onClick={onVoiceRecord}
          className="flex items-center gap-3 p-2 rounded-sm hover:bg-white/10 cursor-pointer group w-full text-left border border-transparent hover:border-border-subtle transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-sm bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Microphone size={18} className="text-primary" weight="bold" />
          </div>
          <div className="flex-1">
            <div className="text-text-primary text-[13px] font-semibold leading-tight">음성 녹음</div>
            <div className="text-text-muted text-[12px] mt-0.5">오디오 메모 녹음</div>
          </div>
        </button>
      </div>
    </div>
  );
};
