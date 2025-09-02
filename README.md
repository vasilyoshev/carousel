# Infinite Image Carousel (React + Vite)

A high-performance **infinite** image carousel built with **React 19**, **TypeScript**, and **Vite**, designed to be smooth, responsive, and reusable. It features **virtualization**, **looping via scroll (no arrows)**, and efficient handling of **10,000+ images**.

<div align="center">
  <a href="https://carousel-ly7m.onrender.com/">
    <img alt="Render – Storybook" src="https://img.shields.io/badge/🚀_Live-Storybook-46E3B7?style=for-the-badge&logo=render&logoColor=white">
  </a>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white">
  <img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Vite 7" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="Storybook 9" src="https://img.shields.io/badge/Storybook-9-FF4785?style=for-the-badge&logo=storybook&logoColor=white">
  <img alt="Vitest 3" src="https://img.shields.io/badge/Vitest-3-6E9F18?style=for-the-badge&logo=vitest&logoColor=white">
  <img alt="SCSS Modules" src="https://img.shields.io/badge/SCSS-Modules-CC6699?style=for-the-badge&logo=sass&logoColor=white">
  <img alt="ESLint" src="https://img.shields.io/badge/Lint-ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white">
  <img alt="Prettier" src="https://img.shields.io/badge/Format-Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white">
  <img alt="MIT" src="https://img.shields.io/badge/License-MIT-informational?style=for-the-badge">
</div>

---

## 📑 Table of Contents
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Props](#props)
- [Architecture](#-architecture)
- [How it Works](#-how-it-works)
- [Responsiveness & Performance](#-responsiveness--performance)
- [Accessibility](#-accessibility)
- [Why Virtual Scroll Instead of Native?](#-why-virtual-scroll-instead-of-native)
- [Performance Benchmarks](#-performance-benchmarks)
- [Limitations / Future Work](#-limitations--future-work)
- [Contributing](#-contributing)
- [License](#-license)

## 🧱 Prerequisites
Node 20+ (recommended)  
Package manager: npm (scripts assume npm but pnpm / yarn should work)

---

## ✨ Features

- **Infinite looping via scroll**
- **Virtualized rendering** (only visible slides + overscan are mounted)
- **Momentum wheel → main-axis mapping** for desktop (no native scroll)
- **Responsive**: adapts to parent size
- **Works with 10k+ images**
- **Configurable & reusable** via props:
  - `orientation`: `'horizontal' | 'vertical'`
  - `gap`: spacing between slides (px)
  - `overscan`: extra slides before/after viewport for smoothness
  - `gain`: sensitivity of wheel/drag input (default tuned)
  - `friction`: momentum decay (default tuned)
- **Robust image UX**: placeholder spinner, error + retry, lazy loading
- **Quality tooling**: Vite, TypeScript, ESLint, Prettier, Vitest, Storybook

---

## 🚀 Getting Started

### 1. Install
```bash
npm install
```

### 2. Run the Vite dev app
```bash
npm run dev
```

### 3. Storybook (local)
```bash
npm run storybook
```

### 4. Type-check, lint, format, tests
```bash
npm run typecheck
npm run lint
npm run prettier
npm test
```

### 5. Production builds
```bash
npm run build           # Vite app build
npm run build-storybook # Storybook static build
```

---

## 📚 Usage

Wrap the carousel in a container that defines its **height** and **width**. The carousel auto-sizes to the container via `ResizeObserver`.

```tsx
import { Carousel } from './components/Carousel/Carousel';

const images = [
  'https://picsum.photos/id/1018/1000/600',
  'https://picsum.photos/id/1025/800/1200',
  'https://picsum.photos/id/103/1200/800',
];

export default function Demo() {
  return (
    <div style={{ width: '100%', height: 320 }}>
      <Carousel
        images={images}
        orientation="horizontal"
        gap={12}
        overscan={10}
      />
    </div>
  );
}
```

### Vertical Example
```tsx
<Carousel
  images={images}
  orientation="vertical"
  gap={8}
  overscan={6}
/>
```

### Minimal (defaults)
```tsx
<Carousel images={images} />
```

### Props
| Prop        | Type                        | Default        | Description |
|-------------|-----------------------------|----------------|-------------|
| images*     | string[]                    | (required)     | Image URLs. |
| orientation | 'horizontal' \| 'vertical'  | 'horizontal'   | Main axis. |
| overscan    | number                      | 2              | Extra slides before/after viewport. |
| gap         | number                      | 12             | Spacing in px between slides. |
| gain        | number                      | tuned constant | Input sensitivity (wheel/drag). |
| friction    | number                      | tuned constant | Momentum decay factor. |

> Only a small window of slides mounts; large arrays (1,000,000+) are fine.

---

## 🧩 Architecture

- `useCarouselLayout` – measures the container, computes exact `offsets`, `sizeAt`, `baseTotal`, and builds a locally repeated list long enough to cover ~2× viewport + overscan.
- `useCarouselVirtualWindow` – computes visible `range` with overscan and applies slice offset.
- `useCarouselInfiniteLoop` – centers on the middle block, re-centers when loop length changes.
- `useCarouselKinetics` – pointer + wheel input, momentum/friction, rAF step (virtual scroll).

---

## 🧠 How it Works

### 1) Virtualization
- Each image gets an extent (width/height) from cross-axis size and aspect ratio.
- Offsets array is built for binary-search of visible range.
- Only a small slice of repeated images is mounted, shifted by a margin offset.

### 2) Infinite Looping
- A minimal number of local repeats are generated automatically.
- Carousel is centered on the mid-block for maximum travel distance.
- Position is wrapped ± loop length when near an edge.

### 3) Smooth Kinetics
- Wheel/drag input mapped to main axis with gain, friction, and speed caps.
- Animator halts below threshold to stop background loops.

---

## 📱 Responsiveness & Performance

- `ResizeObserver` keeps measurements in sync.
- Only a small window of slides is mounted.
- Supports thousands of mixed-aspect-ratio images.

---

## ♿ Accessibility

- Scroll-like interaction, no hidden focus traps.
- Images include `alt` text; you can pass a custom alt factory.
- Future work: keyboard navigation, indicators with `aria-current`.

---

## ❓ Why Virtual Scroll Instead of Native?
- Precise control over momentum and friction (feels consistent across devices)
- Infinite looping without cloning DOM nodes into extremely large scroll areas
- Avoid large scroll offset drift / layout thrash
- Easier to add future kinetic features (snap points, autoplay pause-on-interaction)
- Browsers scroll size is only 33 million pixels

## 🧪 Performance Benchmarks
- Generates 1,000,000 mixed-aspect images

---

## 📜 License

MIT
