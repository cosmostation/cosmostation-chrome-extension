/* eslint-disable @typescript-eslint/no-empty-interface */
import '@mui/system';

import type { ThemeStyle } from '~/types/theme';

declare module '@mui/material/styles' {
  interface Theme extends ThemeStyle {}
  interface ThemeOptions extends ThemeStyle {}

  interface TypographyVariants {
    h7: React.CSSProperties;
    h1n: React.CSSProperties;
    h2n: React.CSSProperties;
    h3n: React.CSSProperties;
    h4n: React.CSSProperties;
    h5n: React.CSSProperties;
    h6n: React.CSSProperties;
    h7n: React.CSSProperties;
    h8n: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h7: React.CSSProperties;
    h1n: React.CSSProperties;
    h2n: React.CSSProperties;
    h3n: React.CSSProperties;
    h4n: React.CSSProperties;
    h5n: React.CSSProperties;
    h6n: React.CSSProperties;
    h7n: React.CSSProperties;
    h8n: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h7: true;
    h1n: true;
    h2n: true;
    h3n: true;
    h4n: true;
    h5n: true;
    h6n: true;
    h7n: true;
    h8n: true;
  }
}
