import '@mui/system';

import type { AccentColor, Color, CommonColor, TypeVariantsTrue, TypoVariants } from '@/styles/theme';

declare module '@mui/material/styles' {
  interface Palette {
    accentColor: AccentColor;
    color: Color;
    commonColor: CommonColor;
  }

  interface PaletteOptions {
    accentColor?: AccentColor;
    color?: Color;
    commonColor?: CommonColor;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants extends TypoVariants {}

  // allow configuration using `createTheme`

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
