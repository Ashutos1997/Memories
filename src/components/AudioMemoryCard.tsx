"use client";

import React from "react";
import { AudioPlayer } from "./AudioPlayer";
import { MemoryCard, MemoryVariant } from "./MemoryCard";

interface AudioMemoryCardProps {
  id?: string;
  serial?: string;
  tag?: string;
  date: string;
  src: string;
  variant?: MemoryVariant;
  isHighlighted?: boolean;
  onDragStart?: (e: React.PointerEvent) => void;
  onDelete?: () => void;
  className?: string;
}

export const AudioMemoryCard: React.FC<AudioMemoryCardProps> = ({ 
  id, 
  serial, 
  tag,
  date, 
  src, 
  variant = "default", 
  isHighlighted, 
  onDragStart, 
  onDelete, 
  className 
}) => {
  return (
    <MemoryCard 
      type="audio" 
      serial={serial} 
      tag={tag}
      date={date} 
      isHighlighted={isHighlighted} 
      variant={variant} 
      onDragStart={onDragStart} 
      onDelete={onDelete}
      className={className}
    >
      <div className="py-1">
        <AudioPlayer src={src} variant={variant} />
      </div>
    </MemoryCard>
  );
};
