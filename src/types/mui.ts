import '@mui/system';

import type { Color } from '@/styles/theme';

declare module '@mui/material/styles' {
  interface Palette {
    color: Color;
    // TODO: Add accentColor
    // accentColor: Color;
  }

  interface PaletteOptions {
    color?: Color;
    // TODO: Add accentColor
    // accentColor?: Color;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    h1_B: React.CSSProperties;
    h2_B: React.CSSProperties;
    h2_M: React.CSSProperties;
    h3_B: React.CSSProperties;
    h3_M: React.CSSProperties;
    h4_B: React.CSSProperties;
    b1_B: React.CSSProperties;
    b1_R: React.CSSProperties;
    b2_B: React.CSSProperties;
    b2_M: React.CSSProperties;
    b3_M: React.CSSProperties;
    b3_R: React.CSSProperties;
    b4_M: React.CSSProperties;
    b4_R: React.CSSProperties;
    c1_M: React.CSSProperties;

    h1n_B: React.CSSProperties;
    h2n_M: React.CSSProperties;
    h3n_B: React.CSSProperties;
    h4n_M: React.CSSProperties;
    h5n_M: React.CSSProperties;
    h5n_R: React.CSSProperties;
    h6n_M: React.CSSProperties;
    h6n_R: React.CSSProperties;
    h7n_M: React.CSSProperties;
    h7n_R: React.CSSProperties;
    h8n_M: React.CSSProperties;
    h8n_R: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1_B: React.CSSProperties;
    h2_B: React.CSSProperties;
    h2_M: React.CSSProperties;
    h3_B: React.CSSProperties;
    h3_M: React.CSSProperties;
    h4_B: React.CSSProperties;
    b1_B: React.CSSProperties;
    b1_R: React.CSSProperties;
    b2_B: React.CSSProperties;
    b2_M: React.CSSProperties;
    b3_M: React.CSSProperties;
    b3_R: React.CSSProperties;
    b4_M: React.CSSProperties;
    b4_R: React.CSSProperties;
    c1_M: React.CSSProperties;

    h1n_B: React.CSSProperties;
    h2n_M: React.CSSProperties;
    h3n_B: React.CSSProperties;
    h4n_M: React.CSSProperties;
    h5n_M: React.CSSProperties;
    h5n_R: React.CSSProperties;
    h6n_M: React.CSSProperties;
    h6n_R: React.CSSProperties;
    h7n_M: React.CSSProperties;
    h7n_R: React.CSSProperties;
    h8n_M: React.CSSProperties;
    h8n_R: React.CSSProperties;
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
    subtitle1: false;
    subtitle2: false;
    body1: false;
    body2: false;
    caption: false;
    button: false;
    overline: false;
    h1_B: true;
    h2_B: true;
    h2_M: true;
    h3_B: true;
    h3_M: true;
    h4_B: true;
    b1_B: true;
    b1_R: true;
    b2_B: true;
    b2_M: true;
    b3_M: true;
    b3_R: true;
    b4_M: true;
    b4_R: true;
    c1_M: true;

    h1n_B: true;
    h2n_M: true;
    h3n_B: true;
    h4n_M: true;
    h5n_M: true;
    h5n_R: true;
    h6n_M: true;
    h6n_R: true;
    h7n_M: true;
    h7n_R: true;
    h8n_M: true;
    h8n_R: true;
  }
}
