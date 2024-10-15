import type { Color } from '@/styles/theme';

declare module '@mui/material/styles' {
  interface Palette {
    color: Color;
  }

  interface PaletteOptions {
    color?: Color;
  }
}
