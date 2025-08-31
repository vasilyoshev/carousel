import { useRef, useState } from 'react';

import { Carousel } from './components/Carousel/Carousel';
import type { Orientation } from './types/Orientation';

function App() {
  const picsRef = useRef<string[]>(
    Array.from({ length: 10000 }, (_, i) => {
      const w = 100 + Math.floor(Math.random() * 200);
      const h = 100 + Math.floor(Math.random() * 200);
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
      <div style={{ height: 500, border: '2px solid white' }}>
        <Carousel images={picsRef.current} orientation={orientation} overscan={0} />
      </div>
    </>
  );
}

export default App;
