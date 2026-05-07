"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SpeakerHigh } from "@phosphor-icons/react";
import { MemoryVariant } from "./MemoryCard";

interface AudioPlayerProps {
  src: string;
  variant?: MemoryVariant;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, variant = "default", className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };
    const updateDuration = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    // Initial check in case metadata is already loaded
    if (audio.duration) {
      setDuration(audio.duration);
    }

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', updateDuration);
    audio.addEventListener('canplay', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [src]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={togglePlayPause}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={`w-7 h-7 flex items-center justify-center interactive-state ${
            variant === 'vector' ? 'rounded-none bg-primary text-primary-foreground border border-primary hover:bg-primary/80' : 
            variant === 'scrapbook' ? 'rounded-none bg-[#5D4037]/10 text-[#5D4037] border border-[#5D4037]/20 hover:bg-[#5D4037]/20' :
            'rounded-md bg-primary/10 hover:bg-primary/20 text-text-secondary hover:text-text-primary'
          }`}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause size={12} weight="bold" />
          ) : (
            <Play size={12} weight="bold" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <SpeakerHigh size={14} className={variant === 'scrapbook' ? 'text-[#5D4037]' : 'text-primary'} weight="bold" />
          <span className={`text-[12px] font-bold uppercase tracking-[0.2em] ${variant === 'scrapbook' ? 'text-[#5D4037]/60 font-handwriting' : variant === 'vector' ? 'text-primary' : 'text-text-muted'}`}>Voice Memory</span>
        </div>
      </div>

      {/* Seek & Progress Control */}
      <div className="mb-1.5">
        <input
          type="range"
          min="0"
          max={duration || 0}
          step="any"
          value={currentTime}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={handleSeek}
          aria-label="Seek audio"
          className={`w-full h-1 bg-transparent accent-primary cursor-pointer ${variant === 'vector' || variant === 'scrapbook' ? 'rounded-none h-2' : 'rounded-full'}`}
          style={{
            background: variant === 'scrapbook' ? 
              `linear-gradient(to right, #5D4037 0%, #5D4037 ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(93, 64, 55, 0.1) 100%)` :
              `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, ${variant === 'vector' ? 'rgba(197,165,114,0.1)' : 'rgba(255, 255, 255, 0.1)'} 100%)`
          }}
        />
      </div>

      {/* Time Display */}
      <div className="flex items-center justify-between text-[12px] text-text-muted font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        className="hidden"
        preload="metadata"
      />
    </div>
  );
};
