import '@mui/system';

import type { ThemeStyle } from '../theme';

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Theme extends ThemeStyle {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThemeOptions extends ThemeStyle {}

  interface TypographyVariants {
    h7: React.CSSProperties;
    h8: React.CSSProperties;
    h9: React.CSSProperties;
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
    h8: React.CSSProperties;
    h9: React.CSSProperties;
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
    // disable h3
    // h3: false;
    h7: true;
    h8: true;
    h9: true;
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
