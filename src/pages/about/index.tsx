import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { createFileRoute } from '@tanstack/react-router';

import { ContainerA, ContainerB, ContainerC, StyledBox } from './-styled';

export const Route = createFileRoute('/about/')({
  component: About,
});

function About() {
  const { mode, setMode } = useColorScheme();
  const { t } = useTranslation();

  console.log(mode);
  return (
    <StyledBox
      onClick={() => {
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    >
      {t('test.testA')}
      {t('test.testB')}
      <ContainerA>
        <Typography variant="h2_M">About</Typography>
      </ContainerA>
      <ContainerA>
        <Typography variant="h1_B">About</Typography>
      </ContainerA>
      <ContainerB>
        <Typography variant="h2_B">About</Typography>
      </ContainerB>
      <ContainerC>
        <Typography variant="h2_M">About</Typography>
      </ContainerC>
    </StyledBox>
  );
}
