import type { THEME_TYPE } from '~/constants/theme';

export type ThemeType = ValueOf<typeof THEME_TYPE>;

export type ThemeStyle = {
  mode: 'light' | 'dark';
  colors: Colors;
  accentColors: AccentColors;
  typography: TextTypos &
    NumberTypos & {
      htmlFontSize: number;
    };
};

export type TextTypos = {
  h1: Record<string, unknown>;
  h2: Record<string, unknown>;
  h3: Record<string, unknown>;
  h4: Record<string, unknown>;
  h5: Record<string, unknown>;
  h6: Record<string, unknown>;
  h7: Record<string, unknown>;
};

export type NumberTypos = {
  h1n: Record<string, unknown>;
  h2n: Record<string, unknown>;
  h3n: Record<string, unknown>;
  h4n: Record<string, unknown>;
  h5n: Record<string, unknown>;
  h6n: Record<string, unknown>;
  h7n: Record<string, unknown>;
  h8n: Record<string, unknown>;
};

export type Colors = {
  base01: string;
  base02: string;
  base03: string;
  base04: string;
  base05: string;
  base06: string;
  text01: string;
  text02: string;
};

export type AccentColors = {
  purple01: string;
  purple02: string;
  white: string;
  green: string;
  red: string;
};
