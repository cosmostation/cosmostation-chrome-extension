import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import Button from '~/Popup/components/common/Button';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import SelectChain from '~/Popup/pages/Account/Initialize/components/SelectChain';
import { newMnemonicAccountState, newPrivateKeyAccountState } from '~/Popup/recoils/newAccount';

import { BottomContainer, Container, SelectChainContainer } from './styled';

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();

  const newMnemonicAccount = useRecoilValue(newMnemonicAccountState);
  const newPrivateKeyAccount = useRecoilValue(newPrivateKeyAccountState);

  const { t } = useTranslation();

  useEffect(() => {
    if ((!newMnemonicAccount.accountName || !newMnemonicAccount.mnemonic) && (!newPrivateKeyAccount.accountName || !newPrivateKeyAccount.privateKey)) {
      navigateBack(-2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <SelectChainContainer>
        <SelectChain />
      </SelectChainContainer>
      <BottomContainer>
        <Button onClick={() => navigate('/account/initialize/import/step3')}>{t('pages.Account.Initialize.Import.Step2.entry.next')}</Button>
      </BottomContainer>
    </Container>
  );
}
