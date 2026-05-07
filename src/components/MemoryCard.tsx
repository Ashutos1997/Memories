"use client";

import React from "react";
import { DotsSixVertical, Trash } from "@phosphor-icons/react";

export type MemoryType = "note" | "gallery" | "timeline" | "quote" | "image-raw";
export type MemoryVariant = "default" | "noir" | "vector" | "scrapbook";

interface MemoryCardProps {
  id?: string;
  serial?: string;
  type: MemoryType;
  date: string;
  variant?: MemoryVariant;
  x?: number;
  y?: number;
  children: React.ReactNode;
  className?: string;
  tag?: string;
  onDragStart?: (e: React.PointerEvent) => void;
  onDelete?: () => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ serial, tag, date, variant = "default", x = 0, y = 0, children, className, isHighlighted, onDragStart, onDelete }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'noir':
        return {
          container: "rounded-[2px] border-white/10 bg-black/40 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
          text: "font-serif tracking-tight text-white/90 leading-relaxed",
          accent: "text-white/40 font-serif italic uppercase tracking-[0.3em]",
          serial: "bg-white text-black rounded-none -top-6 left-0 px-3 py-1 shadow-2xl",
        };
      case 'vector':
        return {
          container: "rounded-none border-2 border-primary bg-canvas shadow-[8px_8px_0px_var(--color-primary)]",
          text: "font-mono tracking-tighter text-primary",
          accent: "text-primary",
          serial: "bg-primary text-primary-foreground rounded-none -top-3 border-2 border-primary",
        };
      case 'scrapbook':
        return {
          container: "rounded-[2px] border-[#E2D1C3] bg-[#F4E9D5] shadow-[5px_5px_15px_rgba(0,0,0,0.2)]",
          text: "font-handwriting text-[#5D4037] leading-relaxed",
          accent: "text-[#8D6E63] font-handwriting",
          serial: "bg-[#8D6E63] text-white rounded-none -top-5 -rotate-2",
        };
      default:
        return {
          container: "rounded-md border-border-subtle bg-surface glass",
          text: "font-normal text-text-primary",
          accent: "text-primary",
          serial: "bg-primary text-primary-foreground rounded-sm -top-2.5",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <article 
      className={`group relative px-3.5 py-5 md:p-6 transition-all duration-500 border ${styles.container} ${className} ${isHighlighted ? 'ring-2 md:ring-4 ring-primary scale-[1.01]' : ''}`}
      style={{ 
        boxShadow: variant === 'default' ? (isHighlighted ? '0 0 30px hsla(38, 42%, 61%, 0.3), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1)' : 'inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1), 0 10px 30px rgba(0, 0, 0, 0.4)') : undefined
      }}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" aria-hidden="true" />

      {variant === 'vector' && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-accent z-[50]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-accent z-[50]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-accent z-[50]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-accent z-[50]" />
          <div className="absolute -bottom-5 right-0 text-[9px] font-mono text-primary/70 tracking-widest uppercase">
            X_{Math.round(x)}:Y_{Math.round(y)}
          </div>
        </>
      )}

      {variant === 'scrapbook' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/30 backdrop-blur-[2px] -rotate-2 border border-white/10 shadow-sm z-[200]" />
      )}

      {(serial || tag) && (
        <div className={`absolute left-6 px-2 py-0.5 shadow-lg z-[100] transform transition-all duration-500 ${styles.serial} ${isHighlighted ? 'scale-110' : ''} ${variant === 'vector' ? 'rounded-none' : ''}`}>
          <span className={`text-[12px] font-mono font-bold tracking-[0.1em]`}>
            {tag ? `#${tag.toUpperCase()}` : serial}
          </span>
        </div>
      )}

      <div className="absolute top-3.5 right-3.5 md:top-5 md:right-5 flex items-center gap-1 z-[100]">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="opacity-30 md:opacity-0 md:group-hover:opacity-20 hover:!opacity-100 text-text-primary hover:text-red-400 p-0.5 interactive-state"
          aria-label="Delete memory"
        >
          <Trash size={18} weight="bold" />
        </button>
        <div 
          className="text-text-muted md:group-hover:text-text-secondary hover:!text-primary cursor-move p-0.5 interactive-state focus:outline-none focus:text-primary"
          onPointerDown={onDragStart}
          role="button"
          tabIndex={0}
          aria-label="Drag to move memory"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
            }
          }}
        >
          <DotsSixVertical size={20} weight="bold" aria-hidden="true" />
        </div>
      </div>

      <div className={`text-[14px] md:text-[15px] leading-relaxed max-w-prose relative z-10 pr-4 md:pr-8 transition-colors duration-500 ${styles.text} ${isHighlighted ? 'text-white' : ''}`}>
        {children}
      </div>

      <div className="mt-3 md:mt-4 flex items-center gap-4">
        <time dateTime={date} className={`text-[12px] font-mono tracking-[0.2em] uppercase font-bold transition-colors duration-500 ${styles.accent} ${isHighlighted ? 'opacity-100' : 'opacity-40'}`}>
          {date}
        </time>
      </div>
    </article>
  );
};

export const RawImageCard: React.FC<{ serial?: string; src: string; isHighlighted?: boolean; variant?: MemoryVariant; x?: number; y?: number; onDragStart?: (e: React.PointerEvent) => void; onDelete?: () => void }> = ({ serial, src, isHighlighted, variant = "default", x = 0, y = 0, onDragStart, onDelete }) => (
  <article className={`group relative shadow-card hover:shadow-elevated transition-all duration-500 border ${variant === 'noir' ? 'rounded-[4px] border-white/20' : variant === 'vector' ? 'rounded-none border-2 border-primary shadow-[8px_8px_0px_var(--color-primary)]' : variant === 'scrapbook' ? 'rounded-[2px] border-[#E2D1C3] bg-white p-2 shadow-[5px_10px_20px_rgba(0,0,0,0.15)]' : 'rounded-lg border-border-subtle'} ${isHighlighted ? 'ring-2 ring-primary scale-[1.01]' : ''}`}>
    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" aria-hidden="true" />
    
    {variant === 'vector' && (
      <>
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary z-[50]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary z-[50]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary z-[50]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary z-[50]" />
        <div className="absolute -bottom-5 right-0 text-[9px] font-mono text-primary/70 tracking-widest uppercase">
          X_{Math.round(x)}:Y_{Math.round(y)}
        </div>
      </>
    )}
    {variant === 'scrapbook' && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/30 backdrop-blur-[2px] -rotate-2 border border-white/10 shadow-sm z-[200]" />
    )}
    {serial && (
      <div className={`absolute top-3 left-3 px-2 py-0.5 z-[100] shadow-xl transition-all duration-500 ${variant === 'noir' ? 'bg-white text-black' : variant === 'vector' ? 'bg-primary text-primary-foreground border-2 border-primary' : variant === 'scrapbook' ? 'bg-[#8D6E63] text-white -rotate-3' : 'bg-primary/90 backdrop-blur-md rounded-sm'} ${isHighlighted ? 'scale-110' : ''} ${variant === 'vector' ? 'rounded-none' : ''}`}>
        <span className={`text-[12px] font-mono font-bold tracking-[0.1em]`}>
          {serial}
        </span>
      </div>
    )}
    <div className="absolute top-3 right-3 flex items-center gap-1 z-[100]">
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
        className={`opacity-60 md:opacity-0 md:group-hover:opacity-60 hover:!opacity-100 text-text-primary hover:text-red-400 p-1.5 bg-black/40 backdrop-blur-md interactive-state ${variant === 'vector' ? 'rounded-none border border-primary/20' : 'rounded-md'}`}
        aria-label="Delete image memory"
      >
        <Trash size={18} weight="bold" />
      </button>
      <div 
        className={`text-text-muted md:group-hover:text-text-secondary hover:!text-text-primary cursor-move p-1.5 bg-black/40 backdrop-blur-md interactive-state focus:outline-none focus:text-white ${variant === 'vector' ? 'rounded-none border border-primary/20' : 'rounded-md'}`}
        onPointerDown={onDragStart}
        role="button"
        tabIndex={0}
        aria-label="Drag to move image memory"
      >
        <DotsSixVertical size={20} weight="bold" aria-hidden="true" />
      </div>
    </div>
    <div className={`overflow-hidden ${variant === 'noir' ? 'rounded-[4px]' : variant === 'vector' ? 'rounded-none' : variant === 'scrapbook' ? 'rounded-[2px]' : 'rounded-sm'}`}>
      <img src={src} alt={`Memory Archive: ${serial || 'Image'}`} className={`w-full h-auto object-cover transition-all duration-700 block select-none ${isHighlighted ? 'opacity-100 scale-105' : 'opacity-90 group-hover:opacity-100'} ${variant === 'noir' ? 'border-[12px] border-white/5 shadow-inner' : variant === 'scrapbook' ? 'border border-black/5' : ''}`} draggable="false" />
    </div>
  </article>
);

export const NoteCard: React.FC<{ id?: string; serial?: string; date: string; content: string; isHighlighted?: boolean; variant?: MemoryVariant; onDragStart?: (e: React.PointerEvent) => void; onDelete?: () => void }> = ({ serial, date, content, isHighlighted, variant, onDragStart, onDelete }) => (
  <MemoryCard type="note" serial={serial} date={date} isHighlighted={isHighlighted} variant={variant} onDragStart={onDragStart} onDelete={onDelete}>
    <p className="whitespace-pre-wrap">{content}</p>
  </MemoryCard>
);

export const GalleryCard: React.FC<{ id?: string; serial?: string; date: string; images: string[]; isHighlighted?: boolean; variant?: MemoryVariant; onDragStart?: (e: React.PointerEvent) => void; onDelete?: () => void }> = ({ serial, date, images, isHighlighted, variant, onDragStart, onDelete }) => (
  <MemoryCard type="gallery" serial={serial} date={date} isHighlighted={isHighlighted} variant={variant} onDragStart={onDragStart} onDelete={onDelete}>
    <div className="grid grid-cols-1 gap-2 md:gap-3">
      {images.map((img, i) => (
        <div key={i} className={`aspect-video overflow-hidden border transition-all duration-700 ${variant === 'vector' ? 'rounded-none border-accent' : 'rounded-sm'} ${isHighlighted ? 'border-accent/40 bg-accent/10' : 'bg-white/5 border-white/5'} group/img`}>
          <img src={img} alt={`Gallery item ${i + 1} of ${images.length} from archive ${serial || ''}`} className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-700" draggable="false" />
        </div>
      ))}
    </div>
  </MemoryCard>
);

export const TimelineCard: React.FC<{ id?: string; serial?: string; date: string; items: { time: string; text: string }[]; isHighlighted?: boolean; variant?: MemoryVariant; onDragStart?: (e: React.PointerEvent) => void; onDelete?: () => void }> = ({ serial, date, items, isHighlighted, variant, onDragStart, onDelete }) => (
  <MemoryCard type="timeline" serial={serial} date={date} isHighlighted={isHighlighted} variant={variant} className="pl-6 md:pl-12" onDragStart={onDragStart} onDelete={onDelete}>
    <div className="space-y-4 md:space-y-6">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <div className={`absolute -left-[22px] md:-left-[38px] top-1.5 md:top-2 w-1 md:w-1.5 h-1 md:h-1.5 interactive-state ${variant === 'vector' ? 'rounded-none bg-primary shadow-[4px_4px_0px_rgba(0,0,0,0.5)]' : 'rounded-full bg-primary shadow-[0_0_8px_hsla(38, 42%, 61%, 0.4)]'} ${isHighlighted ? 'bg-text-primary shadow-[0_0_12px_#fff]' : ''}`} />
          <span className={`text-[12px] font-mono mb-0.5 md:mb-1 block uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${isHighlighted ? 'text-text-primary' : 'text-primary/60'}`}>{item.time}</span>
          <p className={`text-[13px] md:text-[13px] font-normal leading-relaxed transition-colors duration-500 ${isHighlighted ? 'text-white' : 'text-white/90'}`}>{item.text}</p>
        </div>
      ))}
    </div>
  </MemoryCard>
);

export const QuoteCard: React.FC<{ id?: string; serial?: string; date: string; quote: string; author: string; isHighlighted?: boolean; variant?: MemoryVariant; onDragStart?: (e: React.PointerEvent) => void; onDelete?: () => void }> = ({ serial, date, quote, author, isHighlighted, variant, onDragStart, onDelete }) => (
  <MemoryCard type="quote" serial={serial} date={date} isHighlighted={isHighlighted} variant={variant} onDragStart={onDragStart} onDelete={onDelete}>
    <div className="relative py-1 md:py-4 pr-1 md:pr-4">
      <span className={`absolute -top-3 md:-top-4 -left-3 md:-left-4 text-4xl md:text-6xl font-bold opacity-30 select-none transition-colors duration-500 ${isHighlighted ? 'text-white' : 'text-accent/10'}`}>"</span>
      <blockquote className={`text-[16px] md:text-lg font-bold leading-relaxed tracking-tight italic transition-colors duration-500 ${isHighlighted ? 'text-white' : 'text-white/95'}`}>
        {quote}
      </blockquote>
      <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6">
        <div className={`w-6 md:w-8 h-[1px] transition-colors duration-500 ${isHighlighted ? 'bg-white' : 'bg-accent/30'}`} />
        <cite className={`text-[12px] font-bold not-italic tracking-[0.2em] uppercase transition-colors duration-500 ${isHighlighted ? 'text-white' : 'text-accent/80'}`}>{author}</cite>
      </div>
    </div>
  </MemoryCard>
);
