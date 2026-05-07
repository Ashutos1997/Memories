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
        className={`relative w-full max-w-[520px] bg-chrome/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-4 mt-4 z-10">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-full rounded-full transition-all duration-700 ${s <= step ? 'flex-[2] bg-primary' : 'flex-1 bg-white/5'}`} 
            />
          ))}
        </div>

        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-full transition-all z-10"
          aria-label="Skip onboarding"
        >
          <X size={24} weight="bold" />
        </button>

        <div className="p-10 md:p-14">
          <div className="flex flex-col items-center text-center">
            {/* Step Content */}
            <div className="h-[340px] flex flex-col items-center justify-center w-full">
              {step === 1 && (
                <div className="animate-[memoryManifest_0.8s_ease-out_forwards]">
                  <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mb-10 mx-auto relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Sparkle size={40} className="text-primary relative z-10" weight="fill" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">무한한 저장소에<br/>오신 것을 환영합니다</h2>
                  <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-[340px] mx-auto">
                    당신의 소중한 기억들을<br/>
                    무한한 공간에 기록하고 시각화하세요.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="animate-[memoryManifest_0.8s_ease-out_forwards]">
                  <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mb-10 mx-auto relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Hash size={40} className="text-primary relative z-10" weight="bold" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">태그로 더 선명하게</h2>
                  <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-[380px] mx-auto">
                    기록을 남길 때 <span className="text-primary font-bold">#해시태그</span>를 포함해보세요.<br/>
                    수많은 기록 속에서도 원하는 기억을<br/>
                    즉시 찾아낼 수 있습니다.
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-2 text-[13px] font-mono text-primary/60 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                    <span className="opacity-60">예시:</span> #여행 #제도 #학습
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-[memoryManifest_0.8s_ease-out_forwards]">
                  <div className="w-20 h-20 bg-primary/10 rounded-[24px] flex items-center justify-center mb-10 mx-auto relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-[24px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Archive size={40} className="text-primary relative z-10" weight="fill" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">당신만의 아카이브</h2>
                  <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-[360px] mx-auto mb-4">
                    다양한 레이아웃 테마를 적용해<br/>
                    기록을 아름답게 감상하세요.
                  </p>
                  <div className="text-text-muted text-sm font-medium tracking-wide border-t border-white/5 pt-6 mt-6">
                    모든 기억은 브라우저에 안전하게 저장됩니다.
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="w-full mt-10">
              <button
                onClick={nextStep}
                className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_20px_40px_-12px_rgba(197,165,114,0.3)]"
              >
                {step === totalSteps ? "아카이브 시작하기" : "다음 단계로"}
                <CaretRight size={22} weight="bold" />
              </button>
              
              <button 
                onClick={handleClose}
                className="mt-6 text-[14px] text-text-muted hover:text-text-primary transition-colors font-semibold tracking-wide uppercase"
              >
                {step === totalSteps ? "" : "건너뛰기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
