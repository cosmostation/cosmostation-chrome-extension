import { useEffect } from 'react';
import { useResetRecoilState } from 'recoil';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { COSMOS } from '~/constants/chain/cosmos/cosmos';
import { ETHEREUM } from '~/constants/chain/ethereum/ethereum';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import { useTranslation } from '~/Popup/hooks/useTranslation';
import IconButton from '~/Popup/pages/Account/Initialize/components/IconButton';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';

import { ButtonContainer, Container, LogoContainer, LogoImageContainer, LogoTextContainer } from './styled';

import Cosmostation21Icon from '~/images/icons/Cosmostation21.svg';
import CreateAccount28Icon from '~/images/icons/CreateAccount28.svg';
import Import28Icon from '~/images/icons/Import28.svg';
import Logo40Icon from '~/images/icons/Logo40.svg';

export default function Entry() {
  const { navigate } = useNavigate();
  const { t } = useTranslation();

  const resetNewAccount = useResetRecoilState(newMnemonicAccountState);

  const { setChromeStorage } = useChromeStorage();

  const { setCurrentPassword } = useCurrentPassword();

  useEffect(() => {
    resetNewAccount();

    void setChromeStorage('queues', []);
    void setChromeStorage('windowId', null);
    void setChromeStorage('accounts', []);
    void setChromeStorage('accountName', {});
    void setChromeStorage('additionalChains', []);
    void setChromeStorage('additionalEthereumNetworks', []);
    void setChromeStorage('encryptedPassword', null);
    void setChromeStorage('selectedAccountId', '');

    void setChromeStorage('allowedChainIds', [ETHEREUM.id, COSMOS.id]);
    void setChromeStorage('allowedOrigins', []);
    void setChromeStorage('selectedChainId', '');
    void setChromeStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
    void setChromeStorage('encryptedPassword', null);

    void setCurrentPassword(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
      <ButtonContainer>
        <IconButton Icon={CreateAccount28Icon} onClick={() => navigate('/account/initialize/new/mnemonic/step1')}>
          {t('pages.Account.Initialize.entry.createWallet')}
        </IconButton>
        <IconButton Icon={Import28Icon} onClick={() => navigate('/account/initialize/import')}>
          {t('pages.Account.Initialize.entry.importWallet')}
        </IconButton>
      </ButtonContainer>
    </Container>
  );
}
