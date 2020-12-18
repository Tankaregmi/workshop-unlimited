import { createContext } from 'react';

export type Orientations = 'portrait' | 'landscape';

export const initialOrientation: Orientations = window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';

const ScreenOrientationContext = createContext({
  orientation: initialOrientation,
  setOrientation: (orientation: Orientations) => {}
});

export default ScreenOrientationContext;
