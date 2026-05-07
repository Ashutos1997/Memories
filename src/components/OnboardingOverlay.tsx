"use client";

import React, { useState, useEffect } from "react";
import { Hash, Archive, Sparkle, CaretRight, X } from "@phosphor-icons/react";

interface OnboardingOverlayProps {
  onClose: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const totalSteps = 3;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 400);
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      <div 
        className={`relative w-full max-w-[480px] bg-chrome border border-border-subtle rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 flex">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`flex-1 transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-white/10'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Skip onboarding"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            {/* Step Content */}
            <div className="h-[280px] flex flex-col items-center justify-center">
              {step === 1 && (
                <div className="animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Sparkle size={32} className="text-primary" weight="fill" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-3">무한한 저장소에 오신 것을 환영합니다</h2>
                  <p className="text-text-muted leading-relaxed">
                    당신의 소중한 기억들을 무한한 공간에 기록하고 시각화하세요.<br/>
                    메모, 사진, 음성 기록을 자유롭게 배치할 수 있습니다.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Hash size={32} className="text-primary" weight="bold" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-3">태그로 더 선명하게</h2>
                  <p className="text-text-muted leading-relaxed">
                    기록을 남길 때 <span className="text-primary font-bold">#해시태그</span>를 포함해보세요.<br/>
                    (예: "여행 #제도", "강연 #학습")<br/><br/>
                    태그를 사용하면 수많은 기록 속에서도<br/>원하는 기억을 즉시 찾을 수 있습니다.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="animate-[fadeIn_0.5s_ease-out]">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <Archive size={32} className="text-primary" weight="fill" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight mb-3">당신만의 아카이브</h2>
                  <p className="text-text-muted leading-relaxed mb-6">
                    검색창(S)에서 태그를 검색하거나,<br/>
                    다양한 레이아웃 테마를 적용해 기록을 감상하세요.<br/>
                    모든 기억은 브라우저에 안전하게 저장됩니다.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full mt-6">
              <button
                onClick={nextStep}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
              >
                {step === totalSteps ? "기록 시작하기" : "다음"}
                <CaretRight size={18} weight="bold" />
              </button>
              
              {step < totalSteps && (
                <button 
                  onClick={handleClose}
                  className="mt-4 text-[13px] text-text-muted hover:text-text-primary transition-colors font-medium"
                >
                  건너뛰기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
