import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import SelectChain from '~/Popup/pages/Account/Initialize/components/SelectChain';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

import { BottomContainer, Container, SelectChainContainer } from './styled';

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();
  const { t } = useTranslation();

  const newAccount = useRecoilValue(newMnemonicAccountState);

  useEffect(() => {
    if (!newAccount.accountName || !newAccount.mnemonic) {
      navigateBack(-4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <SelectChainContainer>
        <SelectChain />
      </SelectChainContainer>
      <BottomContainer>
        <Button onClick={() => navigate('/account/initialize/new/mnemonic/step5')}>{t('pages.Account.Initialize.New.Mnemonic.Step4.entry.next')}</Button>
      </BottomContainer>
    </Container>
  );
}
