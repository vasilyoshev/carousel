import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';

import type { Orientation } from '../../types/Orientation';

import { Carousel } from './Carousel';

const getRandomPics = (count: number, wMin = 1000, wMax = 3000, hMin = 1000, hMax = 3000) =>
  Array.from({ length: count }, (_, i) => {
    const w = wMin + Math.floor(Math.random() * (wMax - wMin + 1));
    const h = hMin + Math.floor(Math.random() * (hMax - hMin + 1));
    return `https://picsum.photos/seed/${i}/${w}/${h}`;
  });

const Wrapper: React.FC<React.PropsWithChildren<Pick<StoryProps, 'width' | 'height'>>> = ({
  width,
  height,
  children,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: 8,
      overflow: 'hidden',
      border: '1px solid dimgray',
      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------
 * Meta
 * ----------------------------------------------*/

type StoryProps = {
  width: number | string;
  height: number | string;
  orientation: Orientation;
  overscan: number;
  gap: number;
  gain: number;
  friction: number;
};

const meta: Meta<StoryProps> = {
  title: 'Components/Carousel',
  component: Carousel as any,
  parameters: {
    controls: { expanded: true },
    layout: 'padded',
  },
  argTypes: {
    width: { control: { type: 'range', min: 200, max: 1600, step: 10 } },
    height: { control: { type: 'range', min: 200, max: 1000, step: 10 } },
    orientation: { control: { type: 'radio' }, options: ['horizontal', 'vertical'] },
    overscan: { control: { type: 'range', min: 0, max: 50, step: 1 } },
    gap: { control: { type: 'range', min: 0, max: 80, step: 1 } },
    gain: { control: { type: 'range', min: 0.01, max: 1.0, step: 0.01 } },
    friction: { control: { type: 'range', min: 0.8, max: 0.995, step: 0.001 } },
  },
  args: {
    width: 800,
    height: 400,
    orientation: 'horizontal',
    overscan: 10,
    gap: 12,
    gain: 0.12,
    friction: 0.9,
  },
};
export default meta;
type Story = StoryObj<StoryProps>;

/* ------------------------------------------------
 * Stories
 * ----------------------------------------------*/

export const Default: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(50));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const FullScreen: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(400));
    return (
      <Wrapper width="99vw" height="99vh">
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const NoOverscan: Story = {
  args: { overscan: 0 },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(120));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const NoGap: Story = {
  args: { gap: 0 },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(60));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(100));
    return (
      <Wrapper width={300} height="95vh">
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const ZeroImages: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>([]);
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const OneImage: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(['https://picsum.photos/seed/solo/300/300']);
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const TwoImages: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>([
      'https://picsum.photos/seed/a/200/400',
      'https://picsum.photos/seed/b/400/200',
    ]);
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const ErrorStates: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>([
      'https://picsum.photos/seed/good1/300/300',
      'https://this-will-404.example.com/x/300/300',
      'https://picsum.photos/seed/good2/400/250',
      'https://bad.domain/404/200/400',
      'https://picsum.photos/seed/good3/350/350',
    ]);
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const DynamicData: Story = {
  args: { width: 900, height: 320, overscan: 10, gap: 12, orientation: 'horizontal' },
  render: (args) => {
    const [pics, setPics] = useState<string[]>(getRandomPics(5));
    const push = () => setPics((p) => [...p, ...getRandomPics(5, p.length)]);
    const pop = () => setPics((p) => p.slice(0, Math.max(0, p.length - 5)));

    return (
      <>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: 'center' }}>
          <button onClick={push}>+ add 5</button>
          <button onClick={pop}>− remove 5</button>
          <span>Count: {pics.length}</span>
        </div>
        <Wrapper width={args.width} height={args.height}>
          <Carousel
            images={pics}
            orientation={args.orientation}
            overscan={args.overscan}
            gap={args.gap}
            gain={args.gain}
            friction={args.friction}
          />
        </Wrapper>
      </>
    );
  },
};

export const SuperWide: Story = {
  args: { orientation: 'vertical' },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(20, 1000, 1200, 300, 400));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const SuperHigh: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(20, 300, 420, 1000, 1200));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const HighImageCount1000: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(1000));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const HighImageCount10000: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(10000));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const HighImageCount100000: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(100000));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};
export const HighImageCount1000000: Story = {
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(1000000));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const MomentumGentle: Story = {
  args: { gain: 0.12, friction: 0.95 },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(80));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const MomentumSnappy: Story = {
  args: { gain: 0.2, friction: 0.9 },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(80));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const LongGlide: Story = {
  args: { gain: 0.18, friction: 0.985 },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(120));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};

export const NoMomentumFeel: Story = {
  args: { gain: 0.18, friction: 0.001 },
  render: (args) => {
    const picsRef = useRef<string[]>(getRandomPics(60));
    return (
      <Wrapper width={args.width} height={args.height}>
        <Carousel
          images={picsRef.current}
          orientation={args.orientation}
          overscan={args.overscan}
          gap={args.gap}
          gain={args.gain}
          friction={args.friction}
        />
      </Wrapper>
    );
  },
};
