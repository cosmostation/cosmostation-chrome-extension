import { Button, Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { createFileRoute } from '@tanstack/react-router';

import { Container } from './-styled';

export const Route = createFileRoute('/about/')({
  component: About,
});

function About() {
  const { mode, setMode } = useColorScheme();

  console.log(mode);
  return (
    <>
      <Button
        onClick={() => {
          setMode('dark');
          console.log(mode);
        }}
      >
        {'set dark'}
      </Button>
      <Button
        onClick={() => {
          setMode('light');
          console.log(mode);
        }}
      >
        {'set light'}
      </Button>
      <Container>
        <Typography variant="h1">{mode}</Typography>
      </Container>
    </>
  );
}
