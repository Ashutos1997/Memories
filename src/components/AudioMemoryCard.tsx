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
  x?: number;
  y?: number;
  onDragStart?: (e: React.PointerEvent) => void;
  onDelete?: () => void;
  isDragging?: boolean;
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
  x,
  y,
  onDragStart, 
  onDelete, 
  isDragging,
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
      x={x}
      y={y}
      onDragStart={onDragStart} 
      onDelete={onDelete}
      isDragging={isDragging}
      className={className}
    >
      <div className="py-1 pb-4">
        <AudioPlayer src={src} variant={variant} />
      </div>
    </MemoryCard>
  );
};
