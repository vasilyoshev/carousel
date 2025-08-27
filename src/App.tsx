import { Carousel } from './components/Carousel';

function App() {
  const pics = Array.from({ length: 24 }, (_, i) => `https://picsum.photos/seed/${i}/800/600`);

  return (
    <>
      <div style={{ width: 600, height: 300 }}>
        <Carousel images={pics} orientation="horizontal" />
      </div>
      <div style={{ width: 300, height: 600 }}>
        <Carousel images={pics} orientation="vertical" />
      </div>
    </>
  );
}

export default App;
