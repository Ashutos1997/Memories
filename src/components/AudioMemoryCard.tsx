"use client";

import React from "react";
import { AudioPlayer } from "./AudioPlayer";
import { MemoryCard, MemoryVariant } from "./MemoryCard";

interface AudioMemoryCardProps {
  id: string;
  serial?: string;
  tag?: string;
  date: string;
  src: string;
  variant?: MemoryVariant;
  isHighlighted?: boolean;
  x?: number;
  y?: number;
  onDragStart?: (e: React.PointerEvent) => void;
  onDelete?: () => void;
  isDragging?: boolean;
  className?: string;
  isGlobalPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

export const AudioMemoryCard: React.FC<AudioMemoryCardProps> = ({ 
  id, 
  serial, 
  tag,
  date, 
  src, 
  variant = "default", 
  isHighlighted, 
  x,
  y,
  onDragStart, 
  onDelete, 
  isDragging,
  className,
  isGlobalPlaying,
  onPlayStateChange
}) => {
  return (
    <MemoryCard 
      type="audio" 
      serial={serial} 
      tag={tag}
      date={date} 
      isHighlighted={isHighlighted} 
      variant={variant} 
      x={x}
      y={y}
      onDragStart={onDragStart} 
      onDelete={onDelete}
      isDragging={isDragging}
      contentClassName="!pr-[14px] md:!pr-[20px]"
    >
      <div className="py-1 pb-6">
        <AudioPlayer 
          src={src} 
          variant={variant} 
          isGlobalPlaying={isGlobalPlaying}
          onPlayStateChange={onPlayStateChange}
        />
      </div>
    </MemoryCard>
  );
};
