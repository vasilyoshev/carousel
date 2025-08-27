import { Carousel } from './components/Carousel';

function App() {
  const pics = Array.from({ length: 24 }, (_, i) => `https://picsum.photos/seed/${i}/800/600`);

  return (
    <div style={{ padding: 24 }}>
      <Carousel images={pics} snap="none" />
    </div>
  );
}

export default App;
