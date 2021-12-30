/* eslint-disable @typescript-eslint/no-empty-interface */
import '@mui/system';

import type { ThemeStyle } from '~/Popup/styles/theme';

declare module '@mui/material/styles' {
  interface Theme extends ThemeStyle {}
  interface ThemeOptions extends ThemeStyle {}
}
