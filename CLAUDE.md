# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**vs-chords**는 VS Code UI를 오마주한 노드 기반 웹 시퀀서(Node-based Web Sequencer)다. 시각적 노드 그래프로 코드 진행을 설계하고, Graph Traversal 기반으로 실행하는 인터랙티브 음악 도구.

## Development Commands

```bash
pnpm dev      # Start dev server with Turbopack at localhost:3000
pnpm build    # Production build
pnpm lint     # Run ESLint
```

## Tech Stack

- **Core:** Next.js 15 (App Router), React 19, TypeScript (Strict)
- **State:** React useState & useReducer (복잡한 캔버스 액션 처리)
- **Styling:** Tailwind CSS with VS Code theme variables
- **Audio:** Tone.js (Web Audio API) - 예정

## Architecture Principles

**View(UI)와 Logic(Engine)의 철저한 분리.** 컴포넌트는 단일 책임 원칙(SRP) 준수.

### Coordinate Systems (좌표계)

캔버스의 핵심은 두 좌표계 변환:

- **Screen Coordinate (Screen Space):** 브라우저 뷰포트 기준 (clientX, clientY)
- **World Coordinate (World Space):** 무한 캔버스 내부 기준, 노드의 실제 x, y

**Transformation Formula:**
```
WorldX = (ScreenX - PanX) / Zoom
WorldY = (ScreenY - PanY) / Zoom
```

### Execution Model

- **X축은 절대 시간이 아님** - 실행은 Graph Traversal에 의존
- **병렬 실행:** 하나의 Output에서 다수의 Connection 분기 시 Parallel Execution
- 동일 X축 선상(세로 스택) 노드들은 논리적 동시 실행 그룹

## Data Types

```typescript
// types/schema.ts
type NodeType = 'start' | 'melody' | 'chord' | 'beat' | 'loop';

interface Viewport {
  x: number;      // Pan Offset X
  y: number;      // Pan Offset Y
  zoom: number;   // Scale Factor (0.5 ~ 3.0)
}

interface NodeData {
  id: string;
  type: NodeType;
  label: string;
  x: number;      // World Coordinate
  y: number;      // World Coordinate
  w: number;      // Width (Fixed: 96px)
  h: number;      // Height (Fixed: 96px)
  color: string;  // Tailwind Class
  payload?: {
    duration?: number;   // 마디 수
    notes?: string[];    // e.g., ['C4', 'E4', 'G4']
    loopCount?: number;  // Loop 타입 반복 횟수
  };
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
}
```

## Key Components

- `app/page.tsx` - Main client component, global state (nodes, connections, viewport)
- `app/components/editor/Canvas.tsx` - Infinite canvas with pan/zoom, node dragging, connection rendering
- `app/components/editor/NodeItem.tsx` - 96x96px fixed size nodes with input/output ports
- `app/components/layout/` - VS Code-style shell (Header, ActivityBar, Sidebar, StatusBar)

## Core Algorithms

### Infinite Canvas
- Transform Layer: CSS `transform: translate3d(...) scale(...)` 컨테이너 내 렌더링
- Grid Pattern: `background-image: radial-gradient(...)` 줌 레벨에 따라 유기적 변화

### Magnetic Snapping (자석 효과)
Threshold: 20px. 노드 드래그 시:
- `|My.x - Target.x| < 20` → 수직 정렬
- `|My.y - Target.y| < 20` → 수평 정렬
- `|My.x - (Target.x + Target.w + Gap)| < 20` → 순차 배치

### Bezier Connections
SVG path로 렌더링:
- Start: `(Source.x + Source.w, Source.y + Source.h/2)` - 오른쪽 중앙
- End: `(Target.x, Target.y + Target.h/2)` - 왼쪽 중앙
- Control Points: 수평 흐름 강조를 위해 X축 방향 offset

### Drag & Drop
- Palette → Canvas: mousedown 기반 즉시 노드 생성 방식
- mousedown 시: 캔버스에 노드 즉시 생성 후 드래그 상태로 전환
- 노드가 마우스에 붙어서 이동, mouseup 시 배치 확정
- `screenToWorld()` 변환 후 노드 중심이 커서에 오도록 `x - w/2, y - h/2` 보정

## Styling Conventions

VS Code 테마 컬러 (tailwind.config.ts에 정의):
```typescript
colors: {
  editor: '#1e1e1e',
  sidebar: '#252526',
  activity: '#333333',
  accent: '#007acc'
}
```

- Path alias: `@/*` → 프로젝트 루트
- 노드 색상: Tailwind utility classes (e.g., `bg-green-600`)

---

## Work Log (병렬 작업 공유)

병렬로 작업하는 Claude 인스턴스들은 이 섹션에 작업 내용을 기록하여 충돌을 방지하고 진행상황을 공유한다.

**규칙:**
1. 작업 시작 전 이 파일을 읽고 충돌 여부 확인
2. 작업 시작 시 "진행중" 상태로 기록
3. 작업 완료 시 "완료" 상태로 업데이트
4. 수정하는 파일 목록 명시 필수

### 작업 기록 형식
```
### [YYYY-MM-DD HH:MM] 작업 제목
- 상태: 🔄 진행중 | ✅ 완료 | ⛔ 블로킹
- 담당 파일: file1.ts, file2.tsx
- 내용: 작업 설명
- 주의사항: 다른 에이전트가 알아야 할 내용 (옵션)
```

---

## 현재 작업 현황

### [2026-01-18 15:30] 화살표 연결 버그 수정
- 상태: ✅ 완료
- 담당 파일: Canvas.tsx, NodeItem.tsx
- 내용: 노드 간 연결선이 생성되지 않는 버그 수정. 전역 mouseup 이벤트가 connectingSourceId를 먼저 null로 만들어 Input Port의 onConnectEnd가 작동하지 않던 문제 해결. handleMouseUp에서 연결 취소 로직 제거하고 handleMouseDown으로 이동.

### [2026-01-18] 노드 간격 0 스냅 및 포인트 숨김 기능
- 상태: ✅ 완료
- 담당 파일: Canvas.tsx, NodeItem.tsx
- 내용:
  - 노드 드래그 시 간격 0으로 딱 붙을 수 있도록 스냅 로직 수정 (기존 SPACING 제거)
  - 노드가 붙어있을 때 해당 방향의 Input/Output 포인트 숨김 처리
  - hideLeftPort, hideRightPort props 추가

### [2026-01-18 16:30] 드래그 앤 드롭 UX 개선
- 상태: ✅ 완료
- 담당 파일: app/page.tsx, app/components/layout/Sidebar.tsx, app/components/editor/Canvas.tsx
- 내용: HTML5 Drag API에서 mousedown 기반 즉시 노드 생성 방식으로 변경. 사이드바에서 드래그 시작 시 캔버스에 노드가 즉시 생성되어 마우스에 붙어서 드래그됨.
- 변경사항:
  - Sidebar: draggable/onDragStart → onMouseDown으로 변경
  - page.tsx: pendingDragNode 상태 및 콜백 추가
  - Canvas: pendingDragNode 수신 시 노드 생성 + 드래그 상태 전환, handleDrop/onDragOver 제거
