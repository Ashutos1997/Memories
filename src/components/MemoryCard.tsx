"use client";

import React from "react";
import { DotsSixVertical, Trash, Clock } from "@phosphor-icons/react";

export type MemoryType = "note" | "gallery" | "timeline" | "quote" | "image-raw" | "audio";
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
  isHighlighted?: boolean;
  onDragStart?: (e: React.PointerEvent) => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

const DateStamp: React.FC<{ date: string; variant: MemoryVariant; isHighlighted?: boolean; className?: string }> = ({ date, variant, isHighlighted, className }) => {
  const getStampStyles = () => {
    switch (variant) {
      case 'scrapbook':
        return "bg-scrapbook-accent/5 border-scrapbook-accent/20 text-scrapbook-accent font-handwriting rotate-[-3deg] shadow-sm";
      case 'vector':
        return "bg-primary/10 border-primary text-primary font-mono rounded-none";
      case 'noir':
        return "bg-white/5 border-white/20 text-white/60 font-serif italic rotate-[-1deg] backdrop-blur-sm";
      default:
        return "bg-primary/5 border-primary/20 text-primary font-mono rotate-[-2deg] backdrop-blur-[2px]";
    }
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 border rounded-[2px] transition-all duration-500 group-hover:opacity-100 ${getStampStyles()} ${isHighlighted ? 'opacity-100 scale-105 border-primary/40' : 'opacity-40'} ${className}`}>
      <Clock size={10} weight="bold" className="opacity-50" />
      <time dateTime={date} className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase whitespace-nowrap">
        {date}
      </time>
    </div>
  );
};

export const MemoryCard: React.FC<MemoryCardProps> = ({ serial, tag, date, variant = "default", x = 0, y = 0, children, className, isHighlighted, onDragStart, onDelete, isDragging }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'noir':
        return {
          container: "rounded-archival border-white/10 bg-black/40 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
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
          container: "rounded-archival border-scrapbook-border bg-scrapbook-surface shadow-[5px_5px_15px_rgba(0,0,0,0.2)]",
          text: "font-handwriting text-scrapbook-text leading-relaxed",
          accent: "text-scrapbook-accent font-handwriting",
          serial: "bg-scrapbook-accent text-white rounded-none -top-4 -rotate-2",
        };
      default:
        return {
          container: "rounded-md border-border-subtle bg-surface glass",
          text: "font-normal text-text-primary",
          accent: "text-primary",
          serial: "bg-primary text-primary-foreground rounded-sm -top-2",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <article 
      className={`group relative px-4 py-5 md:p-6 transition-all duration-500 border min-h-[90px] md:min-h-[110px] flex flex-col justify-between ${styles.container} ${className} ${isHighlighted ? 'border-primary ring-2 md:ring-4 ring-primary/30 scale-[1.01]' : 'border-border-subtle'} ${isDragging ? '!shadow-2xl' : ''}`}
      style={{ 
        boxShadow: isDragging 
          ? (variant === 'noir' ? '0 60px 100px rgba(0,0,0,0.9)' : variant === 'scrapbook' ? '15px 15px 40px rgba(0,0,0,0.3)' : '0 40px 80px rgba(0,0,0,0.6)')
          : (variant === 'default' ? (isHighlighted ? '0 0 30px hsla(38, 42%, 61%, 0.3), inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1)' : 'inset 0 1px 0 0 hsla(0, 0%, 100%, 0.1), 0 10px 30px rgba(0, 0, 0, 0.4)') : undefined)
      }}
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" aria-hidden="true" />

      {variant === 'vector' && (
        <>
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-accent z-[50]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-accent z-[50]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-accent z-[50]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-accent z-[50]" />
          <div className="absolute -bottom-5 right-0 text-[12px] font-mono text-primary/70 tracking-widest uppercase">
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
          className="text-text-muted md:group-hover:text-text-secondary hover:!text-primary cursor-move p-0.5 interactive-state focus:outline-none focus:text-primary focus:ring-1 focus:ring-primary/40 rounded-sm"
          onPointerDown={onDragStart}
          role="button"
          tabIndex={0}
          aria-label="Drag to move memory"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // For now, we can trigger a visual cue or a simple announcement
              // Real keyboard movement would require a specialized mode, but at minimum
              // we should ensure it doesn't just swallow keys without intent.
              // In this spatial app, we'll mark it as focused so users know it's interactive.
            }
          }}
        >
          <DotsSixVertical size={20} weight="bold" aria-hidden="true" />
        </div>
      </div>

      <div className={`text-[14px] md:text-[15px] leading-relaxed max-w-prose relative z-10 pr-6 md:pr-12 pb-6 md:pb-4 ${styles.text}`}>
        {children}
      </div>

      <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-[100]">
        <DateStamp date={date} variant={variant} isHighlighted={isHighlighted} />
      </div>
    </article>
  );
};

export const RawImageCard: React.FC<{ 
  serial?: string; 
  tag?: string;
  date: string;
  src: string; 
  isHighlighted?: boolean; 
  variant?: MemoryVariant; 
  x?: number; 
  y?: number; 
  onDragStart?: (e: React.PointerEvent) => void; 
  onDelete?: () => void;
  isDragging?: boolean;
}> = ({ serial, tag, date, src, isHighlighted, variant = "default", x = 0, y = 0, onDragStart, onDelete, isDragging }) => (
  <article 
    className={`group relative shadow-card hover:shadow-elevated transition-all duration-500 border ${variant === 'noir' ? 'rounded-archival border-white/20' : variant === 'vector' ? 'rounded-none border-2 border-primary shadow-[8px_8px_0px_var(--color-primary)]' : variant === 'scrapbook' ? 'rounded-archival border-[#E2D1C3] bg-white p-2' : 'rounded-md border-border-subtle'} ${isHighlighted ? 'border-primary ring-2 md:ring-4 ring-primary/30 scale-[1.01]' : 'border-border-subtle'}`}
    style={{
      boxShadow: isDragging 
        ? (variant === 'scrapbook' ? '15px 25px 40px rgba(0,0,0,0.4)' : variant === 'noir' ? '0 60px 100px rgba(0,0,0,0.9)' : '0 40px 80px rgba(0,0,0,0.6)')
        : (variant === 'scrapbook' ? '5px 10px 20px rgba(0,0,0,0.15)' : undefined)
    }}
  >
    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay" aria-hidden="true" />
    
    {variant === 'vector' && (
      <>
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-primary z-[50]" />
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-primary z-[50]" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-primary z-[50]" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-primary z-[50]" />
        <div className="absolute -bottom-5 right-0 text-[12px] font-mono text-primary/70 tracking-widest uppercase">
          X_{Math.round(x)}:Y_{Math.round(y)}
        </div>
      </>
    )}
    {variant === 'scrapbook' && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/30 backdrop-blur-[2px] -rotate-2 border border-white/10 shadow-sm z-[200]" />
    )}
    {(serial || tag) && (
      <div className={`absolute top-3 left-3 px-2 py-0.5 z-[100] shadow-xl transition-all duration-500 ${variant === 'noir' ? 'bg-white text-black' : variant === 'vector' ? 'bg-primary text-primary-foreground border-2 border-primary' : variant === 'scrapbook' ? 'bg-[#8D6E63] text-white -rotate-3' : 'bg-primary/90 backdrop-blur-md rounded-sm'} ${isHighlighted ? 'scale-110' : ''} ${variant === 'vector' ? 'rounded-none' : ''}`}>
        <span className={`text-[12px] font-mono font-bold tracking-[0.1em]`}>
          {tag ? `#${tag.toUpperCase()}` : serial}
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
    <div className={`overflow-hidden ${variant === 'noir' ? 'rounded-archival' : variant === 'vector' ? 'rounded-none' : variant === 'scrapbook' ? 'rounded-archival' : 'rounded-sm'}`}>
      <img src={src} alt={`Memory Archive: ${serial || 'Image'}`} className={`w-full h-auto object-cover transition-all duration-700 block select-none ${isHighlighted ? 'opacity-100 scale-105' : 'opacity-90 group-hover:opacity-100'} ${variant === 'noir' ? 'border-[8px] border-white/5 shadow-inner' : variant === 'scrapbook' ? 'border border-black/5' : ''}`} draggable="false" />
    </div>

    <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-[100]">
      <DateStamp date={date} variant={variant} isHighlighted={isHighlighted} />
    </div>
  </article>
);

export const NoteCard: React.FC<{ 
  id?: string; 
  serial?: string; 
  tag?: string;
  date: string; 
  content: string; 
  isHighlighted?: boolean; 
  variant?: MemoryVariant; 
  x?: number;
  y?: number;
  onDragStart?: (e: React.PointerEvent) => void; 
  onDelete?: () => void; 
  isDragging?: boolean;
}> = ({ serial, tag, date, content, isHighlighted, variant, x, y, onDragStart, onDelete, isDragging }) => (
  <MemoryCard type="note" serial={serial} tag={tag} date={date} isHighlighted={isHighlighted} variant={variant} x={x} y={y} onDragStart={onDragStart} onDelete={onDelete} isDragging={isDragging}>
    <p className={`whitespace-pre-wrap ${variant === 'scrapbook' ? 'text-[#5D4037]' : ''}`}>{content}</p>
  </MemoryCard>
);

export const GalleryCard: React.FC<{ 
  id?: string; 
  serial?: string; 
  tag?: string;
  date: string; 
  images: string[]; 
  isHighlighted?: boolean; 
  variant?: MemoryVariant; 
  x?: number;
  y?: number;
  onDragStart?: (e: React.PointerEvent) => void; 
  onDelete?: () => void;
  isDragging?: boolean;
}> = ({ serial, tag, date, images, isHighlighted, variant, x, y, onDragStart, onDelete, isDragging }) => (
  <MemoryCard type="gallery" serial={serial} tag={tag} date={date} isHighlighted={isHighlighted} variant={variant} x={x} y={y} onDragStart={onDragStart} onDelete={onDelete} isDragging={isDragging}>
    <div className="grid grid-cols-1 gap-2 md:gap-3">
      {images.map((img, i) => (
        <div key={i} className={`aspect-video overflow-hidden border transition-all duration-700 ${variant === 'vector' ? 'rounded-none border-accent' : 'rounded-sm'} ${isHighlighted ? 'border-accent/40 bg-accent/10' : 'bg-white/5 border-white/5'} group/img`}>
          <img src={img} alt={`Gallery item ${i + 1} of ${images.length} from archive ${serial || ''}`} className="w-full h-full object-cover opacity-90 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-700" draggable="false" />
        </div>
      ))}
    </div>
  </MemoryCard>
);

export const TimelineCard: React.FC<{ 
  id?: string; 
  serial?: string; 
  tag?: string;
  date: string; 
  items: { time: string; text: string }[]; 
  isHighlighted?: boolean; 
  variant?: MemoryVariant; 
  x?: number;
  y?: number;
  onDragStart?: (e: React.PointerEvent) => void; 
  onDelete?: () => void;
  isDragging?: boolean;
}> = ({ serial, tag, date, items, isHighlighted, variant, x, y, onDragStart, onDelete, isDragging }) => (
  <MemoryCard type="timeline" serial={serial} tag={tag} date={date} isHighlighted={isHighlighted} variant={variant} x={x} y={y} className="pl-6 md:pl-12" onDragStart={onDragStart} onDelete={onDelete} isDragging={isDragging}>
    <div className="space-y-4 md:space-y-6">
      {items.map((item, i) => (
        <div key={i} className="relative">
          <div className={`absolute -left-[22px] md:-left-[38px] top-1.5 md:top-2 w-1 md:w-1.5 h-1 md:h-1.5 interactive-state ${variant === 'vector' ? 'rounded-none bg-primary shadow-[4px_4px_0px_rgba(0,0,0,0.5)]' : 'rounded-full bg-primary shadow-[0_0_8px_hsla(38, 42%, 61%, 0.4)]'}`} />
          <span className={`text-[12px] font-mono mb-0.5 md:mb-1 block uppercase tracking-[0.2em] font-bold text-primary/60`}>{item.time}</span>
          <p className={`text-[13px] md:text-[13px] font-normal leading-relaxed`}>{item.text}</p>
        </div>
      ))}
    </div>
  </MemoryCard>
);

export const QuoteCard: React.FC<{ 
  id?: string; 
  serial?: string; 
  tag?: string;
  date: string; 
  quote: string; 
  author: string; 
  isHighlighted?: boolean; 
  variant?: MemoryVariant; 
  x?: number;
  y?: number;
  onDragStart?: (e: React.PointerEvent) => void; 
  onDelete?: () => void;
  isDragging?: boolean;
}> = ({ serial, tag, date, quote, author, isHighlighted, variant, x, y, onDragStart, onDelete, isDragging }) => (
  <MemoryCard type="quote" serial={serial} tag={tag} date={date} isHighlighted={isHighlighted} variant={variant} x={x} y={y} onDragStart={onDragStart} onDelete={onDelete} isDragging={isDragging}>
    <div className="relative py-1 md:py-4 pr-1 md:pr-4">
      <span className={`absolute -top-3 md:-top-4 -left-3 md:-left-4 text-4xl md:text-6xl font-bold opacity-30 select-none transition-colors duration-500 text-accent/10`}>"</span>
      <blockquote className={`text-[16px] md:text-lg font-bold leading-relaxed tracking-tight italic`}>
        {quote}
      </blockquote>
      <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6">
        <div className={`w-6 md:w-8 h-[1px] transition-colors duration-500 bg-accent/30`} />
        <cite className={`text-[12px] font-bold not-italic tracking-[0.2em] uppercase transition-colors duration-500 text-accent/80`}>{author}</cite>
      </div>
    </div>
  </MemoryCard>
);
