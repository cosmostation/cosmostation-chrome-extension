import '@mui/system';

import type { ThemeStyle } from '../theme';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Theme extends ThemeStyle {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThemeOptions extends ThemeStyle {}

  interface TypographyVariants {
    h10: React.CSSProperties;
    h20: React.CSSProperties;
    h30: React.CSSProperties;
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
    h10: React.CSSProperties;
    h20: React.CSSProperties;
    h30: React.CSSProperties;
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
    h1: false;
    h2: false;
    h3: false;
    h4: false;
    h5: false;
    h6: false;
    h7: false;
    h8: false;
    h9: false;
    h10: true;
    h20: true;
    h30: true;
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
