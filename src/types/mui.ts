import '@mui/system';

import type { Color, TypeVariantsTrue, TypoVariants } from '@/styles/theme';

declare module '@mui/material/styles' {
  interface Palette {
    color: Color;
  }

  interface PaletteOptions {
    color?: Color;
  }
}

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypographyVariants extends TypoVariants {}

  // allow configuration using `createTheme`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypographyVariantsOptions extends TypoVariants {}
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides extends TypeVariantsTrue {
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
  }
}
