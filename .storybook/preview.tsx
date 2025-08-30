import type { Preview } from '@storybook/react';

import '../src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    viewport: {
      viewports: {
        mobileS: { name: 'Mobile S (320x640)', styles: { width: '320px', height: '640px' } },
        mobileL: { name: 'Mobile L (414x896)', styles: { width: '414px', height: '896px' } },
        tablet: { name: 'Tablet (768x1024)', styles: { width: '768px', height: '1024px' } },
        laptop: { name: 'Laptop (1024x768)', styles: { width: '1024px', height: '768px' } },
        desktop: { name: 'Desktop (1440x900)', styles: { width: '1440px', height: '900px' } },
      },
      defaultViewport: 'desktop',
    },
  },
};

export default preview;
