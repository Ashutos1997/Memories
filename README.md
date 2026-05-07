# 🏛️ Memories: The Infinite Spatial Archive

A high-fidelity, mobile-responsive archival interface designed for the spatial curation of memories. Built with a minimalist "Archival Obsidian" aesthetic, it transforms traditional data entry into a tactile, cinematic experience.

![Memories Preview](https://via.placeholder.com/1200x600/0a0a0a/C5A572?text=MEMORIES:+INFINITE+SPATIAL+ARCHIVE)

## ✨ Core Features

### 🌌 Infinite Archival Canvas
*   **Spatial Curation**: Pan and zoom across an infinite workspace to organize memories geographically.
*   **Minimap Navigation**: Real-time viewport tracking with a high-fidelity "Golden Rectangle" indicator for effortless navigation across large archives.
*   **Cinematic Motion**: Every interaction—from manifestation to disposal—is driven by custom weighted archival transitions (cubic-bezier 0.65, 0, 0.35, 1).

### 🖋️ Spatial Drawing Engine
*   **Archival Ink**: Annotate the canvas with real-time, ink-like strokes that are pinned to the world coordinate system.
*   **Drawing Curation**: Sketches are first-class citizens; you can select, drag, and delete annotations with the same precision as memory cards.
*   **Adaptive UI**: Control handles for drawings intelligently scale to maintain readability at any zoom level.

### 🗃️ High-Fidelity Memory Cards
*   **Diverse Formats**: Native support for **Notes**, **Galleries**, **Timelines**, **Quotes**, **Raw Images**, and **Audio Memories**.
*   **Dynamic Manifestation**: Cards resolve from a blurred ghost state into sharp matter, ensuring a fluid and atmospheric loading experience.
*   **Obsidian Design System**: A disciplined geometric language using 8px archival radii and a curated glassmorphic palette.

### 📱 Performance & Persistence
*   **Local-First Architecture**: Built on **IndexedDB**, ensuring all memories and drawings are persisted locally for high-speed retrieval.
*   **Mobile Optimized**: A high-performance touch engine with specialized interaction modes for panning, selecting, and drawing.

## 🛠️ Technology Stack

*   **Core**: [Next.js](https://nextjs.org/) (React 19)
*   **Styling**: Vanilla CSS with [Tailwind CSS 4](https://tailwindcss.com/) for geometric tokens.
*   **Icons**: [Phosphor Icons](https://phosphoricons.com/)
*   **Persistence**: IndexedDB (Native Web API)
*   **Logic**: Web Audio API (for future frequency manifestation) & Canvas API (for the spatial drawing engine).

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Ashutos1997/Memories.git
    cd Memories
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open the Archive**:
    Navigate to `http://localhost:3000` to begin your archival journey.

## ⌨️ Hotkeys

*   **V**: Selection Mode
*   **H**: Pan Mode
*   **D**: Drawing Mode
*   **S**: Search Focus
*   **+ / -**: Zoom In / Out

---

Designed with 🖤 by the Archival Team.
