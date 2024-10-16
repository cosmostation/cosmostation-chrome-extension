import { useTranslation } from 'react-i18next';
import { useColorScheme } from '@mui/material/styles';
import { createFileRoute } from '@tanstack/react-router';

import { StyledBox } from './-styled';

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
    </StyledBox>
  );
}
