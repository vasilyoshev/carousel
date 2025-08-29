import { useRef, useState } from 'react';

import { Carousel } from './components/Carousel';
import type { Orientation } from './types/Orientation';

function App() {
  const picsRef = useRef<string[]>(
    Array.from({ length: 100 }, (_, i) => {
      const w = 300 + Math.floor(Math.random() * 700); // 300–1000
      const h = 300 + Math.floor(Math.random() * 700);
      return `https://picsum.photos/seed/${i}/${w}/${h}`;
    }),
  );

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
      <div style={{ height: 500, border: '2px solid white' }}>
        <Carousel images={picsRef.current} orientation={orientation} />
      </div>
      <div style={{ width: 300, height: 600, border: '2px solid white' }}>
        <Carousel images={picsRef.current} orientation="vertical" />
      </div>
    </>
  );
}

export default App;
