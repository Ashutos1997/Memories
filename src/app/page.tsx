"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Canvas } from "@/components/Canvas";
import { PromptBar } from "@/components/PromptBar";
import { NavigationChrome } from "@/components/NavigationChrome";
import { Minimap } from "@/components/Minimap";
import { NoteCard, GalleryCard, TimelineCard, QuoteCard, RawImageCard, MemoryVariant } from "@/components/MemoryCard";
import { AudioMemoryCard } from "@/components/AudioMemoryCard";
import { Image as ImageIcon, LockSimple } from "@phosphor-icons/react";
import { EmptyState } from "@/components/EmptyState";
import { InteractionMode } from "@/types";

interface Memory {
  id: string;
  serial: string;
  tag?: string;
  type: "note" | "gallery" | "timeline" | "quote" | "image-raw" | "audio";
  date: string;
  x: number;
  y: number;
  data: any;
  rotation?: number;
  isDeleting?: boolean;
}

// --- IndexedDB Wrapper ---
const DB_NAME = "ArchivalDatabase";
const STORE_NAME = "memories_v1";

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToDB = async (key: string, value: any) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
  } catch (e) {
    console.error("IndexedDB Save Error:", e);
  }
};

const loadFromDB = async (key: string): Promise<any> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (e) {
    console.error("IndexedDB Load Error:", e);
    return null;
  }
};

export default function Home() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("select");
  const [activeTemplate, setActiveTemplate] = useState<MemoryVariant>("default");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [zIndices, setZIndices] = useState<Record<string, number>>({});
  const maxZ = useRef(10);
  const [isMobile, setIsMobile] = useState(false);
  const [drawings, setDrawings] = useState<{ id: string; points: { x: number; y: number }[] }[]>([]);
  
  const [manifestingPos, setManifestingPos] = useState({ x: 0, y: 0 });
  const [manifestingType, setManifestingType] = useState<"text" | "image" | "audio">("text");
  const [externalAction, setExternalAction] = useState<{ type: 'note' | 'image' | 'audio'; timestamp: number } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [focusedMemoryId, setFocusedMemoryId] = useState<string | null>(null);


  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Navigation & History Logic ---
  // This ensures that 'Back' button/gesture closes overlays instead of exiting the app
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If we have an overlay open, close it and prevent default navigation
      if (focusedMemoryId || interactionMode === 'search') {
        setFocusedMemoryId(null);
        setInteractionMode('select');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // When an overlay opens, push a dummy state to history
    if (focusedMemoryId || interactionMode === 'search') {
      window.history.pushState({ overlay: true }, "");
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [focusedMemoryId, interactionMode]);

  // Persistence Layer
  useEffect(() => {
    const loadArchive = async () => {
      const savedMemories = await loadFromDB("memories");
      const savedOffset = await loadFromDB("offset");
      const savedZoom = await loadFromDB("zoom");

      if (savedMemories) {
        const updatedMemories = savedMemories.map((m: any) => ({
          ...m,
          serial: m.serial || (m.tag ? m.tag : `IDX-${Math.floor(100 + Math.random() * 900)}`)
        }));
        setMemories(updatedMemories);
      }
      const savedDrawings = await loadFromDB("drawings");
      if (savedDrawings) setDrawings(savedDrawings);
      if (savedOffset) setOffset(savedOffset);
      if (savedZoom) setZoom(savedZoom);
      setIsInitialLoad(false);
    };
    loadArchive();
  }, []);

  useEffect(() => {
    if (memories.length > 0 || drawings.length > 0) {
      saveToDB("memories", memories);
      saveToDB("drawings", drawings);
      saveToDB("offset", offset);
      saveToDB("zoom", zoom);
    }
  }, [memories, drawings, offset, zoom]);

  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const draggedMemoryId = useRef<string | null>(null);
  const draggedElementRef = useRef<HTMLDivElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialMemoryPos = useRef({ x: 0, y: 0 });
  const isDraggingMove = useRef(false);

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.1, 2)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 0.1, 0.1)), []);

  const handleAddMemory = async (prompt: string) => {
    // Extract tag if present (e.g., #vacation)
    const tagMatch = prompt.match(/#(\w+)/);
    const tag = tagMatch ? tagMatch[1] : undefined;
    const cleanContent = prompt.replace(/#(\w+)/, '').trim();

    const currentPosX = -offset.x / zoom;
    const currentPosY = -offset.y / zoom;
    setManifestingPos({ x: currentPosX, y: currentPosY });
    setManifestingType("text");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newId = Math.random().toString(36).substring(7);
    const newMemory: Memory = {
      id: newId,
      serial: tag ? tag.toUpperCase() : `IDX-${Math.floor(100 + Math.random() * 900)}`,
      tag: tag,
      type: "note",
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
      x: currentPosX,
      y: currentPosY,
      data: { content: cleanContent || prompt },
    };
    setMemories(prev => [...prev, newMemory]);
    setIsLoading(false);
  };

  const handleFileUpload = async (file: File, prompt?: string) => {
    const tagMatch = prompt?.match(/#(\w+)/);
    const tag = tagMatch ? tagMatch[1] : undefined;

    const isAudio = file.type.startsWith('audio/');
    const currentPosX = -offset.x / zoom;
    const currentPosY = -offset.y / zoom;
    setManifestingPos({ x: currentPosX, y: currentPosY });
    setManifestingType(isAudio ? "audio" : "image");
    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newId = Math.random().toString(36).substring(7);
      const newMemory: Memory = {
        id: newId,
        serial: tag ? tag.toUpperCase() : `IDX-${Math.floor(100 + Math.random() * 900)}`,
        tag: tag,
        type: isAudio ? "audio" : "image-raw",
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
        x: currentPosX,
        y: currentPosY,
        data: { src: base64String },
      };
      setMemories(prev => [...prev, newMemory]);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMemory = async (id: string) => {
    setMemories(prev => prev.map(m => m.id === id ? { ...m, isDeleting: true } : m));
    await new Promise(resolve => setTimeout(resolve, 600));
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    saveToDB("memories", updated);
  };

  useEffect(() => {
    const handleDeleteDrawing = (e: any) => {
      const id = e.detail;
      setDrawings(prev => prev.filter(d => d.id !== id));
    };
    window.addEventListener('archival-delete-drawing', handleDeleteDrawing);
    return () => window.removeEventListener('archival-delete-drawing', handleDeleteDrawing);
  }, []);

  const handleSearchRetrieve = (query: string) => {
    const memory = memories.find(m => 
      m.tag?.toLowerCase() === query.toLowerCase().replace('#', '') ||
      m.serial.toLowerCase() === query.toLowerCase() || 
      (m.type === 'note' && m.data.content.toLowerCase().includes(query.toLowerCase()))
    );

    if (memory) {
      setOffset({ x: -memory.x * zoom, y: -memory.y * zoom });
      setHighlightedId(memory.id);
    }
  };

  const handleNextMemory = useCallback(() => {
    if (!focusedMemoryId || memories.length === 0) return;
    const currentIndex = memories.findIndex(m => m.id === focusedMemoryId);
    const nextIndex = (currentIndex + 1) % memories.length;
    setFocusedMemoryId(memories[nextIndex].id);
  }, [focusedMemoryId, memories]);

  const handlePrevMemory = useCallback(() => {
    if (!focusedMemoryId || memories.length === 0) return;
    const currentIndex = memories.findIndex(m => m.id === focusedMemoryId);
    const prevIndex = (currentIndex - 1 + memories.length) % memories.length;
    setFocusedMemoryId(memories[prevIndex].id);
  }, [focusedMemoryId, memories]);

  const onMemoryDragStart = (id: string, e: React.PointerEvent, element: HTMLDivElement) => {
    if (interactionMode !== 'select') return;
    e.stopPropagation();
    draggedMemoryId.current = id;
    draggedElementRef.current = element;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingMove.current = false;
    const mem = memories.find(m => m.id === id);
    if (mem && !mem.isDeleting) initialMemoryPos.current = { x: mem.x, y: mem.y };
    else { draggedMemoryId.current = null; return; }
    setActiveDragId(id);
    
    // Elevate Z-Index
    maxZ.current += 1;
    setZIndices(prev => ({ ...prev, [id]: maxZ.current }));
    
    document.body.style.cursor = 'grabbing';
  };

  const onDrawingDragStart = (id: string, e: React.PointerEvent) => {
    if (interactionMode !== 'select') return;
    e.stopPropagation();
    draggedMemoryId.current = id;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingMove.current = false;
    const draw = drawings.find(d => d.id === id);
    if (draw) {
      // For drawings, we don't have a single x,y yet, so we'll just track the start
      initialMemoryPos.current = { x: 0, y: 0 }; 
    }
    setActiveDragId(id);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'v') setInteractionMode('select');
      else if (key === 'h') setInteractionMode('pan');
      else if (key === 's') setInteractionMode('search');
      else if (key === 'd') setInteractionMode('draw');
      else if (e.code === 'Space') {
        if (interactionMode !== 'pan') {
          e.preventDefault();
          setInteractionMode('pan');
        }
      }
      else if (key === '+' || key === '=') { e.preventDefault(); handleZoomIn(); }
      else if (key === '-' || key === '_') { e.preventDefault(); handleZoomOut(); }
      else if (e.key === 'Escape') {
        if (focusedMemoryId) setFocusedMemoryId(null);
        else if (interactionMode === 'search') setInteractionMode('select');
      }
      else if (e.key === 'ArrowRight' && focusedMemoryId) {
        handleNextMemory();
      }
      else if (e.key === 'ArrowLeft' && focusedMemoryId) {
        handlePrevMemory();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        setInteractionMode('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleZoomIn, handleZoomOut, interactionMode, focusedMemoryId]);

  // Template System Logic
  const applyTemplate = useCallback((templateId: string) => {
    if (memories.length === 0) return;

    // Map template IDs to graphic variants
    const variantMap: Record<string, MemoryVariant> = {
      'grid': 'default',
      'noir': 'noir',
      'vector': 'vector',
      'scrapbook': 'scrapbook'
    };

    setActiveTemplate(variantMap[templateId] || 'default');

    setMemories(prev => {
      const count = prev.length;
      return prev.map((memory, index) => {
        let newX = 0;
        let newY = 0;
        let newRotation = 0;

        switch (templateId) {
          case 'noir': // Editorial Staggered Layout
            const isLeft = index % 2 === 0;
            newX = isLeft ? -120 : 120;
            newY = index * 320 + (isLeft ? 0 : 160);
            newRotation = isLeft ? -1 : 1;
            break;
          
          case 'grid':
            const cols = Math.ceil(Math.sqrt(count));
            const col = index % cols;
            const row = Math.floor(index / cols);
            newX = (col - (cols - 1) / 2) * 450;
            newY = (row - (Math.ceil(count / cols) - 1) / 2) * 500;
            newRotation = 0;
            break;

          case 'scrapbook': // Scrapbook uses organic cluster
            const angle = (index / count) * Math.PI * 2;
            const radius = 100 + Math.random() * 500;
            newX = Math.cos(angle) * radius;
            newY = Math.sin(angle) * radius;
            newRotation = (Math.random() - 0.5) * 30;
            break;

          case 'vector': // Vector uses poster as base
            const jitterX = (Math.floor(Math.random() * 12) - 6) * 10;
            const jitterY = (Math.floor(Math.random() * 12) - 6) * 10;
            newX = (index % 2 === 0 ? -150 : 150) + jitterX;
            newY = Math.floor(index / 2) * 450 + jitterY;
            newRotation = (Math.random() - 0.5) * 4;
            break;

          default:
            return memory;
        }

        return { ...memory, x: newX, y: newY, rotation: newRotation };
      });
    });

    // Smart Camera Adjustment
    if (templateId === 'grid' || templateId === 'scrapbook') {
      setOffset({ x: 0, y: 0 });
      setZoom(0.5);
    } else {
      setOffset({ x: 0, y: 0 });
      setZoom(0.7);
    }
  }, [memories.length]);

  useEffect(() => {
    const onGlobalMove = (e: PointerEvent) => {
      if (draggedMemoryId.current) {
        const dx = (e.clientX - dragStartPos.current.x) / zoom;
        const dy = (e.clientY - dragStartPos.current.y) / zoom;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDraggingMove.current = true;
        
        if (isDraggingMove.current) {
          // If it's a memory card
          if (draggedElementRef.current) {
            const newX = initialMemoryPos.current.x + dx;
            const newY = initialMemoryPos.current.y + dy;
            draggedElementRef.current.style.left = `calc(50% + ${newX}px)`;
            draggedElementRef.current.style.top = `calc(50% + ${newY}px)`;
            setMemories(prev => prev.map(m => m.id === draggedMemoryId.current ? { ...m, x: newX, y: newY } : m));
          } else {
            // If it's a drawing
            setDrawings(prev => prev.map(d => 
              d.id === draggedMemoryId.current 
                ? { ...d, points: d.points.map(p => ({ x: p.x + (e.movementX / zoom), y: p.y + (e.movementY / zoom) })) } 
                : d
            ));
          }
        }
      }
    };
    const onGlobalUp = (e: PointerEvent) => {
      if (draggedMemoryId.current) {
        draggedMemoryId.current = null;
        draggedElementRef.current = null;
        setActiveDragId(null);
        document.body.style.cursor = '';
        // Small delay to prevent onClick from firing immediately after drag
        setTimeout(() => {
          isDraggingMove.current = false;
        }, 50);
      }
    };
    window.addEventListener('pointermove', onGlobalMove);
    window.addEventListener('pointerup', onGlobalUp);
    return () => {
      window.removeEventListener('pointermove', onGlobalMove);
      window.removeEventListener('pointerup', onGlobalUp);
    };
  }, [zoom, memories, interactionMode]);

  const handleDrawComplete = (points: { x: number; y: number }[]) => {
    const newDrawing = { id: Math.random().toString(36).substring(7), points };
    setDrawings(prev => [...prev, newDrawing]);
  };

  // MOBILE GATE - Removed block, kept as warning if needed but allowing full access
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-bold shadow-2xl interactive-state">
        Skip to main content
      </a>
      <main 
        id="main-content"
        ref={canvasRef}
        className={`relative h-screen w-screen overflow-hidden font-pretendard text-text-primary transition-all duration-1000 ${
      activeTemplate === 'noir' ? 'bg-[#0a0a0a]' : 
      activeTemplate === 'vector' ? 'bg-canvas' : 
      activeTemplate === 'scrapbook' ? 'bg-[#1a1410] bg-[url("https://www.transparenttextures.com/patterns/p6.png")]' : 
      'bg-canvas'
    }`}>
      {/* Subtle Archive Title */}
      <div 
        className={`fixed top-4 md:top-8 left-6 md:left-1/2 md:-translate-x-1/2 z-[100] h-[40px] md:h-[56px] flex items-center pointer-events-none select-none transition-all duration-1000 animate-sharpen ${
          activeTemplate === 'scrapbook' ? 'text-scrapbook-accent opacity-40' : 
          activeTemplate === 'noir' ? 'text-white opacity-20' : 
          'text-primary opacity-30'
        }`}
      >
        <h1 className="font-handwriting text-2xl md:text-3xl tracking-[0.4em] md:tracking-[0.8em] font-light leading-none">기억</h1>
      </div>

      {activeTemplate === 'noir' && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-10" />
      )}
      <div className={`absolute inset-0 bg-noise pointer-events-none noise-breathing ${
        activeTemplate === 'vector' ? 'opacity-[0.1] bg-[linear-gradient(to_right,#C5A572_1px,transparent_1px),linear-gradient(to_bottom,#C5A572_1px,transparent_1px)] [background-size:50px_50px]' : ''
      }`} />
      {activeTemplate === 'vector' && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(to right, var(--color-primary) 1px, transparent 1px), linear-gradient(to bottom, var(--color-primary) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      )}
      
      <NavigationChrome 
        memories={memories} 
        zoom={zoom} 
        offset={offset} 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
      />
      
      <Minimap memories={memories} offset={offset} zoom={zoom} />
      
      <Canvas 
        zoom={zoom} 
        mode={interactionMode === 'draw' ? 'draw' : interactionMode === 'pan' ? 'pan' : 'select'} 
        onOffsetChange={(newOffset) => {
          if (newOffset.x !== offset.x || newOffset.y !== offset.y) {
            setOffset(newOffset);
          }
        }} 
        onZoomChange={setZoom} 
        onDrawComplete={handleDrawComplete}
        onDrawingDragStart={onDrawingDragStart}
        drawings={drawings}
        externalOffset={offset}
      >
        {isLoading && (
          <div className="absolute z-[60] pointer-events-none animate-manifest" style={{ left: `calc(50% + ${manifestingPos.x}px)`, top: `calc(50% + ${manifestingPos.y}px)`, transform: 'translate(-50%, -50%)' }}>
            <div className={`flex flex-col items-center justify-center gap-2 md:gap-4 animate-ghost glass border-border-subtle rounded-md px-4 py-5 md:p-6 shadow-2xl ${
              manifestingType === 'image' ? 'w-[200px] md:w-[320px] h-[140px] md:h-[200px]' : 
              manifestingType === 'audio' ? 'w-[85vw] max-w-[320px] md:max-w-[400px] h-[100px] md:h-[120px]' :
              'w-[85vw] max-w-[320px] md:max-w-[400px] h-[160px] md:h-[240px]'
            }`}>
              <div className="relative">
                {manifestingType === 'image' ? (
                  <ImageIcon size={32} className="text-primary/20" />
                ) : manifestingType === 'audio' ? (
                  <div className="flex items-center gap-1.5 h-6">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-1 bg-primary/40 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                ) : (
                  <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-primary/20 rounded-sm animate-pulse flex items-center justify-center">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-primary/20" />
                  </div>
                )}
              </div>
              <span className={`text-[12px] font-mono tracking-[0.4em] uppercase font-bold ${manifestingType === 'image' ? 'text-text-muted' : 'text-primary/60'}`}>
                {manifestingType === 'audio' ? '오디오 동기화' : '기억 선명화'}
              </span>
            </div>
          </div>
        )}
        
        {/* Vector Mode Tracers */}
        {activeTemplate === 'vector' && memories.length > 1 && (
          <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ overflow: 'visible', zIndex: 0 }}>
            {memories.map((m, i) => {
              if (i === 0) return null;
              const prev = memories[i-1];
              return (
                <g key={`trace-group-${i}`}>
                  <line
                    x1={`calc(50% + ${prev.x}px)`}
                    y1={`calc(50% + ${prev.y}px)`}
                    x2={`calc(50% + ${m.x}px)`}
                    y2={`calc(50% + ${m.y}px)`}
                    stroke="var(--color-primary)"
                    strokeWidth="1"
                    strokeDasharray="4 8"
                    className="opacity-20"
                  />
                  {/* Control Point Node */}
                  <rect
                    x={`calc(50% + ${m.x}px - 3px)`}
                    y={`calc(50% + ${m.y}px - 3px)`}
                    width="6"
                    height="6"
                    fill="var(--color-primary)"
                    className="opacity-40"
                  />
                </g>
              );
            })}
            {/* Start Node */}
            {memories.length > 0 && (
              <rect
                x={`calc(50% + ${memories[0].x}px - 3px)`}
                y={`calc(50% + ${memories[0].y}px - 3px)`}
                width="6"
                height="6"
                fill="var(--color-primary)"
                className="opacity-40"
              />
            )}
          </svg>
        )}
        
        {memories.map((memory) => (
          <div 
            key={memory.id} 
            className={`absolute will-change-transform z-10 cursor-grab active:cursor-grabbing ${memory.isDeleting ? 'animate-dispose pointer-events-none' : 'animate-manifest'}`} 
            style={{ 
              left: `calc(50% + ${memory.x}px)`, 
              top: `calc(50% + ${memory.y}px)`, 
              transform: `translate(-50%, -50%) rotate(${memory.rotation || 0}deg)`, 
              transition: activeDragId === memory.id || memory.isDeleting ? 'none' : 'all 1.2s var(--transition-timing-function-archival)', 
              opacity: memory.isDeleting ? 0 : 1,
              zIndex: activeDragId === memory.id ? 999 : (zIndices[memory.id] || 10)
            }} 
            onPointerDown={(e) => onMemoryDragStart(memory.id, e, e.currentTarget)}
          >
            <div className={`${memory.type === 'image-raw' ? 'w-[200px] md:w-[320px]' : 'w-[85vw] max-w-[320px] md:max-w-[400px]'} ${activeDragId === memory.id ? 'scale-[1.02] rotate-[2deg]' : ''} transition-transform duration-300`}>
              {memory.type === "note" && <NoteCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} content={memory.data.content} onDelete={() => handleDeleteMemory(memory.id)} isHighlighted={highlightedId === memory.id} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={activeDragId === memory.id} />}
              {memory.type === "gallery" && <GalleryCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} images={Array.isArray(memory.data.content) ? memory.data.content : []} onDelete={() => handleDeleteMemory(memory.id)} isHighlighted={highlightedId === memory.id} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={activeDragId === memory.id} />}
              {memory.type === "timeline" && <TimelineCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} items={Array.isArray(memory.data.content) ? memory.data.content : []} onDelete={() => handleDeleteMemory(memory.id)} isHighlighted={highlightedId === memory.id} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={activeDragId === memory.id} />}
              {memory.type === "quote" && <QuoteCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} quote={memory.data.content} author={memory.data.author || "익명"} onDelete={() => handleDeleteMemory(memory.id)} isHighlighted={highlightedId === memory.id} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={activeDragId === memory.id} />}
              {memory.type === "image-raw" && (
                <div onClick={(e) => {
                  if (!isDraggingMove.current) {
                    e.stopPropagation();
                    setFocusedMemoryId(memory.data.src);
                  }
                }}>
                  <RawImageCard serial={memory.serial} tag={memory.tag} src={memory.data.src} onDelete={() => handleDeleteMemory(memory.id)} isHighlighted={highlightedId === memory.id} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={activeDragId === memory.id} />
                </div>
              )}
              {memory.type === "audio" && <AudioMemoryCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} src={memory.data.src} onDelete={() => handleDeleteMemory(memory.id)} isHighlighted={highlightedId === memory.id} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={activeDragId === memory.id} />}
            </div>
          </div>
        ))}
      </Canvas>

      {!isInitialLoad && memories.length === 0 && drawings.length === 0 && !isLoading && (
        <EmptyState 
          onModeChange={setInteractionMode}
          onAction={(type) => setExternalAction({ type, timestamp: Date.now() })}
        />
      )}
      <PromptBar 
        onSubmit={handleAddMemory} 
        onUpload={handleFileUpload} 
        onSearch={handleSearchRetrieve}
        onScrapbook={() => applyTemplate('scrapbook')}
        onReset={() => applyTemplate('grid')}
        isLoading={isLoading} 
        mode={interactionMode} 
        onModeChange={setInteractionMode} 
        activeTemplate={activeTemplate}
        externalAction={externalAction}
      />

      {/* Focus Mode Lightbox */}
      {focusedMemoryId && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-[fadeIn_0.3s_ease-out] p-4 md:p-12 overflow-hidden"
          onClick={() => setFocusedMemoryId(null)}
        >
          {/* Progress Indicator */}
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1002] flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-white/40 tracking-[0.2em] uppercase">
            <span>{memories.findIndex(m => m.id === focusedMemoryId) + 1}</span>
            <span className="opacity-20">/</span>
            <span>{memories.length}</span>
          </div>

          {/* Navigation Controls - Desktop */}
          <button 
            className="fixed left-6 top-1/2 -translate-y-1/2 z-[1002] w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-110 active:scale-90 border border-white/5"
            onClick={(e) => { e.stopPropagation(); handlePrevMemory(); }}
            aria-label="Previous memory"
          >
            <div className="w-3 h-3 border-l-2 border-t-2 border-white -rotate-45 translate-x-1" />
          </button>

          <button 
            className="fixed right-6 top-1/2 -translate-y-1/2 z-[1002] w-12 h-12 hidden md:flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-110 active:scale-90 border border-white/5"
            onClick={(e) => { e.stopPropagation(); handleNextMemory(); }}
            aria-label="Next memory"
          >
            <div className="w-3 h-3 border-r-2 border-t-2 border-white rotate-45 -translate-x-1" />
          </button>
          {/* Top Right Close Button for Mobile/Desktop Ergonomics */}
          <button 
            className="fixed top-6 right-6 md:top-12 md:right-12 z-[1001] w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setFocusedMemoryId(null);
            }}
            aria-label="Close lightbox"
          >
            <div className="relative w-6 h-6">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white rotate-45" />
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -rotate-45" />
            </div>
          </button>

          <div 
            className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center gap-8 animate-[focusIn_0.5s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={e => e.stopPropagation()}
          >
            {(() => {
              const memory = memories.find(m => m.id === focusedMemoryId);
              if (!memory) return null;
              
              return (
                <div className="w-full flex flex-col items-center gap-8">
                  <div className="w-full max-w-[500px] scale-[1.1] md:scale-[1.25] transition-transform duration-500">
                    {memory.type === "note" && <NoteCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} content={memory.data.content} onDelete={() => { handleDeleteMemory(memory.id); setFocusedMemoryId(null); }} isHighlighted={false} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={false} />}
                    {memory.type === "gallery" && <GalleryCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} images={Array.isArray(memory.data.content) ? memory.data.content : []} onDelete={() => { handleDeleteMemory(memory.id); setFocusedMemoryId(null); }} isHighlighted={false} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={false} />}
                    {memory.type === "timeline" && <TimelineCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} items={Array.isArray(memory.data.content) ? memory.data.content : []} onDelete={() => { handleDeleteMemory(memory.id); setFocusedMemoryId(null); }} isHighlighted={false} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={false} />}
                    {memory.type === "quote" && <QuoteCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} quote={memory.data.content} author={memory.data.author || "익명"} onDelete={() => { handleDeleteMemory(memory.id); setFocusedMemoryId(null); }} isHighlighted={false} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={false} />}
                    {memory.type === "image-raw" && <RawImageCard serial={memory.serial} tag={memory.tag} src={memory.data.src} onDelete={() => { handleDeleteMemory(memory.id); setFocusedMemoryId(null); }} isHighlighted={false} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={false} />}
                    {memory.type === "audio" && <AudioMemoryCard id={memory.id} serial={memory.serial} tag={memory.tag} date={memory.date} src={memory.data.src} onDelete={() => { handleDeleteMemory(memory.id); setFocusedMemoryId(null); }} isHighlighted={false} variant={activeTemplate} x={memory.x} y={memory.y} isDragging={false} />}
                  </div>
                  
                  {/* Mobile Navigation Helpers */}
                  <div className="md:hidden flex items-center gap-12 mt-8">
                    <button 
                      className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white active:bg-white/10 active:scale-90 transition-all"
                      onClick={handlePrevMemory}
                    >
                      <div className="w-4 h-4 border-l-2 border-t-2 border-white -rotate-45 translate-x-1" />
                    </button>
                    <button 
                      className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white active:bg-white/10 active:scale-90 transition-all"
                      onClick={handleNextMemory}
                    >
                      <div className="w-4 h-4 border-r-2 border-t-2 border-white rotate-45 -translate-x-1" />
                    </button>
                  </div>

                  <button 
                    className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-md font-mono text-[12px] tracking-[0.3em] uppercase transition-all hover:tracking-[0.4em] active:scale-95"
                    onClick={() => setFocusedMemoryId(null)}
                  >
                    닫기 (ESC)
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </main>
    </>
  );
}
