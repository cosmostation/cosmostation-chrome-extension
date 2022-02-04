/* eslint-disable @typescript-eslint/no-empty-interface */
import '@mui/system';

import type { ThemeStyle } from '~/Popup/styles/theme';

declare module '@mui/material/styles' {
  interface Theme extends ThemeStyle {}
  interface ThemeOptions extends ThemeStyle {}

  interface TypographyVariants {
    h1n: React.CSSProperties;
    h2n: React.CSSProperties;
    h3n: React.CSSProperties;
    h4n: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1n: React.CSSProperties;
    h2n: React.CSSProperties;
    h3n: React.CSSProperties;
    h4n: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1n: true;
    h2n: true;
    h3n: true;
    h4n: true;
  }
}
