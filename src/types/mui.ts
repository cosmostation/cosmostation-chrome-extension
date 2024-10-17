import '@mui/system';

import type { Color } from '@/styles/theme';

declare module '@mui/material/styles' {
  interface Palette {
    color: Color;
  }

  interface PaletteOptions {
    color?: Color;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    h10: React.CSSProperties;
    h20: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h10: React.CSSProperties;
    h20: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h10: true;
    h20: true;
  }
}
