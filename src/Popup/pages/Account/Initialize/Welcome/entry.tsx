import { useState } from 'react';
import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import Checkbox from '~/Popup/components/common/Checkbox';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import {
  BottomContainer,
  Container,
  LogoContainer,
  LogoImageContainer,
  LogoTextContainer,
  TermButton,
  TermContainer,
  TermTextContainer,
  WelcomeContainer,
  WelcomeDescriptionContainer,
  WelcomeTitleContainer,
} from './styled';

import Cosmostation21Icon from '~/images/icons/Cosmostation21.svg';
import Logo40Icon from '~/images/icons/Logo40.svg';

export default function Entry() {
  const { t, language } = useTranslation();

  const [checked, setChecked] = useState(false);

  const { navigate } = useNavigate();

  return (
    <Container>
      <LogoContainer>
        <LogoImageContainer>
          <Logo40Icon />
        </LogoImageContainer>
        <LogoTextContainer>
          <Cosmostation21Icon />
        </LogoTextContainer>
      </LogoContainer>
      <WelcomeContainer>
        <WelcomeTitleContainer>
          <Typography variant="h2">{t('pages.Account.Initialize.Welcome.entry.title')}</Typography>
        </WelcomeTitleContainer>
        <WelcomeDescriptionContainer>
          <div>
            <Typography variant="h3">{t('pages.Account.Initialize.Welcome.entry.description1')}</Typography>
          </div>
          <div>
            <Typography variant="h3">{t('pages.Account.Initialize.Welcome.entry.description2')}</Typography>
          </div>
        </WelcomeDescriptionContainer>
      </WelcomeContainer>
      <BottomContainer>
        <TermContainer>
          <Checkbox onChange={(e) => setChecked(e.currentTarget.checked)} checked={checked} />
          <TermTextContainer>
            <Typography variant="h5">I have read and agree to the&nbsp;</Typography>
          </TermTextContainer>
          <TermButton type="button" onClick={() => window.open(`https://cosmostation.io/service_${language === 'ko' ? 'kr' : 'en'}`)}>
            <Typography variant="h5">
              <u>Terms of use</u>
            </Typography>
          </TermButton>
        </TermContainer>
        <Button onClick={() => navigate('/account/initialize')} disabled={!checked}>
          {t('pages.Account.Initialize.Welcome.entry.startButton')}
        </Button>
      </BottomContainer>
    </Container>
  );
}
