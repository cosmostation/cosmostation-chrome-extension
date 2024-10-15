import { Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { createFileRoute } from '@tanstack/react-router';

import { StyledBox } from './-styled';

export const Route = createFileRoute('/about/')({
  component: About,
});

function About() {
  const { mode, setMode } = useColorScheme();

  console.log(mode);
  return (
    <>
      <StyledBox
        onClick={() => {
          setMode(mode === 'light' ? 'dark' : 'light');
        }}
      >
        ddd
      </StyledBox>
      <Typography variant="h1">hello</Typography>
      <Typography variant="h10">hello</Typography>
      <Typography variant="h20">hello</Typography>
      <h1>hello</h1>
    </>
  );
}
