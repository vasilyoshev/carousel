import { useRef, useState } from 'react';

import { Carousel } from './components/Carousel/Carousel';
import type { Orientation } from './types/Orientation';

function App() {
  // const picsRef = useRef<string[]>(
  //   Array.from({ length: 4 }, (_, i) => {
  //     const w = 1000; // 300–1000
  //     const h = 100 + Math.floor(Math.random() * 200);
  //     return `https://picsum.photos/seed/${i}/${w}/${h}`;
  //   }),
  // );
  const picsRef = useRef<string[]>(
    Array.from({ length: 10000 }, (_, i) => {
      const w = 100 + Math.floor(Math.random() * 200);
      const h = 100 + Math.floor(Math.random() * 200);
      return `https://picsum.photos/seed/${i}/${w}/${h}`;
    }),
  );
  // const picsRef = useRef<string[]>([
  //   'https://picsum.photos/seed/1/10/300',
  //   'https://picsum.photos/seed/2/10/300',
  //   'https://picsum.photos/seed/2/10/300',
  //   'https://picsum.photos/seed/2/10/300',
  //   'https://picsum.photos/seed/2/10/300',
  //   'https://picsum.photos/seed/2/10/300',
  //   'https://picsum.photos/seed/2/10/300',
  //   'https://picsum.photos/seed/3/10/300',
  // ]);

  const [orientation, setOrientation] = useState<Orientation>('vertical');
  return (
    <>
      <button
        onClick={() => setOrientation((o) => (o === 'horizontal' ? 'vertical' : 'horizontal'))}
      >
        Change orientation
      </button>
      {/* <div style={{ width: 600, height: 600, border: '2px solid white' }}>
        <Carousel images={picsRef.current} orientation={orientation} gap={30} />
      </div> */}
      <div style={{ height: 800, border: '2px solid white' }}>
        <Carousel images={picsRef.current} orientation={orientation} />
      </div>
      {/* <div style={{ width: 300, height: 600, border: '2px solid white' }}>
        <Carousel images={picsRef.current} orientation="vertical" />
      </div> */}
    </>
  );
}

export default App;
