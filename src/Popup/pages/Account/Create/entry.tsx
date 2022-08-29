import { useEffect } from 'react';
import { useResetRecoilState } from 'recoil';

import MenuButton from '~/Popup/components/MenuButton';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

import { Container, ListContainer } from './styled';

export default function Entry() {
  const { navigate } = useNavigate();

  const resetNewAccount = useResetRecoilState(newMnemonicAccountState);

  const { t } = useTranslation();

  useEffect(() => {
    resetNewAccount();
  }, [resetNewAccount]);
  return (
    <Container>
      <ListContainer>
        <MenuButton onClick={() => navigate('/account/create/new/mnemonic/step1')}>{t('pages.Account.Create.entry.createAccount')}</MenuButton>
        <MenuButton onClick={() => navigate('/account/create/new/ledger')}>{t('pages.Account.Create.entry.createLedgerAccount')}</MenuButton>
        <MenuButton onClick={() => navigate('/account/create/import/mnemonic')}>{t('pages.Account.Create.entry.importMnemonic')}</MenuButton>
        <MenuButton onClick={() => navigate('/account/create/import/private-key')}>{t('pages.Account.Create.entry.importPrivateKey')}</MenuButton>
      </ListContainer>
    </Container>
  );
}
