import { Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { createFileRoute } from '@tanstack/react-router';

import { ContainerA, ContainerB, ContainerC, StyledBox } from './-styled';

export const Route = createFileRoute('/about/')({
  component: About,
});

function About() {
  const { mode, setMode } = useColorScheme();

  console.log(mode);
  return (
    <StyledBox
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    >
      <ContainerA>
        <Typography variant="h10">About</Typography>
      </ContainerA>
      <ContainerB>
        <Typography variant="h20">About</Typography>
      </ContainerB>
      <ContainerC>
        <Typography variant="h20">About</Typography>
      </ContainerC>
    </StyledBox>
  );
}
