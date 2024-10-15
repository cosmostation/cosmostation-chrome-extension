import { createTheme } from '@mui/material/styles';

export type Color = typeof color;

const color = {
  test1: '#000000',
  test2: '#ffffff',
  test3: '#000000',
  test4: '#ffffff',
  test5: '#000000',
  test6: '#ffffff',
};

export const theme = createTheme({
  palette: { color },
});
