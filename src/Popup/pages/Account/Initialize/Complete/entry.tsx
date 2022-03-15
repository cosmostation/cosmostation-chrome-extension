import { Typography } from '@mui/material';

import Button from '~/Popup/components/common/Button';
import { useTranslation } from '~/Popup/hooks/useTranslation';

import { BottomContainer, Check, CheckContainer, Container, DescriptionContainer, TitleContainer } from './styled';

import Check46x33Icon from '~/images/icons/Check46x33.svg';

export default function Entry() {
  const { t } = useTranslation();

  return (
    <Container>
      <TitleContainer>
        <Typography variant="h2">{t('pages.Account.Initialize.Complete.entry.title')}</Typography>
      </TitleContainer>
      <DescriptionContainer>
        <Typography variant="h4">{t('pages.Account.Initialize.Complete.entry.description')}</Typography>
      </DescriptionContainer>
      <CheckContainer>
        <Check>
          <Check46x33Icon />
        </Check>
      </CheckContainer>
      <BottomContainer>
        <Button onClick={() => window.close()}>{t('pages.Account.Initialize.Complete.entry.done')}</Button>
      </BottomContainer>
    </Container>
  );
}
