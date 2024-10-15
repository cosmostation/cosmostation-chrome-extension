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
    <StyledBox
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    >
      ddd
    </StyledBox>
  );
}
