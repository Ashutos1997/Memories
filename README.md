# 🏛️ Memories: 무한한 공간적 아카이브

기억의 공간적 큐레이션을 위해 설계된 고해상도 모바일 반응형 아카이브 인터페이스입니다. 미니멀한 "Archival Obsidian" 미학으로 구축되어, 전통적인 데이터 입력을 촉각적이고 영화적인 경험으로 변화시킵니다.

<img width="2856" height="1592" alt="image" src="https://github.com/user-attachments/assets/e81a33fc-feef-48ee-829b-1a8467424649" />

## ✨ 주요 기능

### 🌌 무한한 아카이브 캔버스 (Infinite Canvas)
*   **공간적 큐레이션**: 무한한 작업 공간에서 기억을 지리적으로 배치하고 팬/줌 기능을 통해 자유롭게 탐색하세요.
*   **패럴랙스 헤더 (Parallax Depth)**: 캔버스 이동에 반응하는 헤더 레이어를 통해 아카이브에 물리적인 깊이감을 더했습니다.
*   **실시간 미니맵 (Interactive Minimap)**: 뷰포트 트래킹 뿐만 아니라, 선택된 기억을 실시간으로 강조(Highlighting)하여 광활한 공간에서도 길을 잃지 않게 돕습니다.

### 🔍 아카이브 스포트라이트 (Global Search)
*   **시각적 격리 (Visual Isolation)**: 검색 시 관련 없는 기억들을 흐릿하게 조절하고 대상 기억에 강력한 하이라이트를 적용하여 몰입감을 높입니다.
*   **태그 기반 탐색**: `#tag` 시스템을 통해 연관된 기억들을 공간적으로 순회하며 탐색할 수 있습니다.

### 🖋️ 공간적 드로잉 엔진 (Drawing Engine)
*   **아카이브 잉크**: 월드 좌표계에 고정되는 실시간 잉크 스타일 스트로크로 캔버스에 주석을 남기세요.
*   **일급 객체화**: 스케치 또한 기억 카드와 동일하게 선택, 드래그, 삭제가 가능한 독립적인 데이터로 관리됩니다.

### 🗃️ 고해상도 기억 카드 (Archival Cards)
*   **멀티 포맷 지원**: **노트**, **원본 이미지**, 그리고 **음성 기억**을 완벽하게 지원합니다.
*   **에디토리얼 디자인**: 8px 아카이브 반경(Radius)과 정교한 글래스모피즘 팔레트를 사용하는 엄격한 기하학적 언어를 적용했습니다.
*   **동적 테마**: 'Scrapbook' 등 아카이브의 성격에 맞는 테마로 전환이 가능합니다.

### 📱 성능 및 지속성
*   **로컬 퍼스트 (IndexedDB)**: 모든 데이터는 브라우저 내부에 저장되어 초고속 로딩과 개인정보 보호를 동시에 실현합니다.
*   **모바일 최적화**: 인체공학적으로 설계된 하단 내비게이션과 터치 제스처를 통해 모바일에서도 데스크톱 이상의 조작감을 제공합니다.

## 🛠️ 기술 스택

*   **Core**: [Next.js](https://nextjs.org/) (React 19)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (Geometric Tokens)
*   **Icons**: [Phosphor Icons](https://phosphoricons.com/)
*   **Persistence**: IndexedDB (Native Web API)
*   **Logic**: Canvas API & Web Audio API

## 🚀 시작하기

1.  **저장소 클론**:
    ```bash
    git clone https://github.com/Ashutos1997/Memories.git
    cd Memories
    ```

2.  **의존성 설치**:
    ```bash
    npm install
    ```

3.  **개발 서버 실행**:
    ```bash
    npm run dev
    ```

4.  **아카이브 열기**:
    브라우저에서 `http://localhost:3000`으로 접속하여 아카이브 여정을 시작하세요.

## ⌨️ 단축키

*   **V**: 선택 모드 (Selection)
*   **H**: 이동 모드 (Pan)
*   **D**: 드로잉 모드 (Draw)
*   **S**: 검색 포커스 (Search)
*   **U**: 레이아웃 초기화 (Reset Layout)
*   **+ / -**: 확대 / 축소 (Zoom)

---

Ash J @2026
