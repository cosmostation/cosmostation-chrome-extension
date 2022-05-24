import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import Password from '~/Popup/pages/Account/Initialize/components/Password';
import { newMnemonicAccountState } from '~/Popup/recoils/newAccount';
import { aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import { Container } from './styled';

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const newAccount = useRecoilValue(newMnemonicAccountState);

  useEffect(() => {
    if (!newAccount.accountName || !newAccount.mnemonic) {
      navigateBack(-5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Password
        onSubmit={async (data) => {
          const accountId = uuidv4();

          await setChromeStorage('encryptedPassword', sha512(data.password));

          await setChromeStorage('accounts', [
            ...chromeStorage.accounts,
            {
              id: accountId,
              type: 'MNEMONIC',
              bip44: { addressIndex: `${newAccount.addressIndex}` },
              encryptedMnemonic: aesEncrypt(newAccount.mnemonic, data.password),
              encryptedPassword: aesEncrypt(data.password, newAccount.mnemonic),
              encryptedRestoreString: sha512(newAccount.mnemonic),
            },
          ]);

          await setChromeStorage('selectedAccountId', accountId);

          await setChromeStorage('accountName', { ...chromeStorage.accountName, [accountId]: newAccount.accountName });

          await setChromeStorage('selectedChainId', chromeStorage.allowedChainIds[0]);

          await setChromeStorage('selectedNetworkId', { [ETHEREUM_NETWORKS[0].parentId]: ETHEREUM_NETWORKS[0].id });

          navigate('/account/initialize/complete');
        }}
      />
    </Container>
  );
}

// million reflect vital fatal couple reform banner rate step glad ranch exact
