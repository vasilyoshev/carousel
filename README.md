# Infinite Image Carousel (React + Vite)

A high‑performance **infinite** image carousel built with **React 19**, **TypeScript**, and **Vite**, designed to be smooth, responsive, and reusable. It features **virtualization**, **looping via scroll (no arrows)**, and efficient handling of **10,000+ images**.

<div align="center">
  <a href="https://carousel-ly7m.onrender.com/">
    <img alt="Render – Storybook" src="https://img.shields.io/badge/Render-Storybook-46E3B7?logo=render&logoColor=white">
  </a>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white">
  <img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite 7" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white">
  <img alt="Storybook 9" src="https://img.shields.io/badge/Storybook-9-FF4785?logo=storybook&logoColor=white">
  <img alt="Vitest 3" src="https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white">
  <img alt="SCSS Modules" src="https://img.shields.io/badge/SCSS-Modules-CC6699?logo=sass&logoColor=white">
  <img alt="ESLint" src="https://img.shields.io/badge/Lint-ESLint-4B32C3?logo=eslint&logoColor=white">
  <img alt="Prettier" src="https://img.shields.io/badge/Format-Prettier-F7B93E?logo=prettier&logoColor=white">
  <img alt="MIT" src="https://img.shields.io/badge/License-MIT-informational">
</div>

---

## ✨ Features

- **Infinite looping via scroll**
- **Virtualized rendering** (only visible slides + overscan are mounted)
- **Momentum wheel → horizontal mapping** for desktop
- **Responsive**: adapts to parent size
- **Works with 10k+ images**
- **Configurable & reusable** via props:
  - `orientation`: `'horizontal' | 'vertical'`
  - `gap`: spacing between slides (px)
  - `overscan`: extra slides before/after viewport for smoothness
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

### 4. Type‑check, lint, format, tests
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

Wrap the carousel in a container that defines its **height** and **width**. The carousel auto‑sizes to the container via `ResizeObserver`.

```tsx
import { Carousel } from './components/Carousel/Carousel';

const images = [
  // Works with Picsum URLs
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

### Props

```ts
export type Orientation = 'horizontal' | 'vertical';

export interface CarouselProps {
  images: string[];            // required list of image URLs
  orientation?: Orientation;   // default 'horizontal'
  overscan?: number;           // default 10; extra slides rendered around viewport
  gap?: number;                // default 12; spacing in pixels between slides
}
```

**Notes**
- The component estimates slide lengths from **aspect ratios**. For Picsum URLs, it parses `/width/height` from the URL.
- For horizontal orientation, desktop wheel input is mapped to horizontal motion with friction and max‑speed caps; vertical orientation uses native vertical scroll.

---

## 🧠 How it Works

### 1) Virtualization
- Each image gets an **estimated extent** (width for horizontal, height for vertical) derived from the container’s cross‑axis size and the image’s aspect ratio.
- We build a **prefix‑sum offsets array**: `offset[i] = sum(slide[0..i-1] + gaps)`.
- On scroll, we **binary‑search** the offsets to compute the visible **range** and apply **overscan**.
- Non‑visible content is collapsed into two **padding items** (`paddingStart`, `paddingEnd`) so total scroll size remains accurate.

### 2) Infinite Looping
- We **repeat** the input list (`repeatCount` times) until the total length covers multiple viewports.
- The scroll position is **centered** on the middle block to maximize travel distance before a seam.
- When approaching the “edge” block, we **teleport** the scroll position by ± one loop length while preserving the **fractional offset** so the jump is seamless.
- A guard flag prevents feedback loops during teleporting.

### 3) Smooth Wheel→Horizontal Mapping
- On desktop, vertical wheel input is converted to **horizontal velocity** with **friction**, **gain**, and **speed caps** for a natural feel.
- The animator halts below a stop threshold to avoid background loops.

---

## 📱 Responsiveness & Performance

- **ResizeObserver** keeps measurements in sync when the parent resizes.
- Only a **small window** of slides is mounted; this enables **thousands of items** without sluggishness.
- The list can handle **mixed aspect ratios** reliably (panoramas, portraits, squares).

---

## ♿ Accessibility

- Non‑content padding items are marked with `aria-hidden`.
- Images include `alt` text; loading and error states are exposed visually.
- **Future work** (nice‑to‑haves): keyboard focus ring for the scroller, optional page indicators with `aria-current`, reduced‑motion tuning.

---

## 🔧 Configuration Tips

- **`gap`**: increase for more breathing room; the virtualized total keeps scroll metrics correct.
- **`overscan`**: increase if you see edge flashes during **very** fast scrolls; keep modest for best perf.
- **`Orientation`**: horizontal enables desktop wheel→horizontal momentum; vertical uses native vertical scroll.

---

## 📜 License

MIT
