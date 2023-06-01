import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ETHEREUM_NETWORKS } from '~/constants/chain';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { useNavigate } from '~/Popup/hooks/useNavigate';
import Password from '~/Popup/pages/Account/Initialize/components/Password';
import { newMnemonicAccountState, newPrivateKeyAccountState } from '~/Popup/recoils/newAccount';
import { aesEncrypt, sha512 } from '~/Popup/utils/crypto';

import { Container } from './styled';

export default function Entry() {
  const { navigateBack, navigate } = useNavigate();
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();

  const newMnemonicAccount = useRecoilValue(newMnemonicAccountState);
  const newPrivateKeyAccount = useRecoilValue(newPrivateKeyAccountState);

  useEffect(() => {
    if ((!newMnemonicAccount.accountName || !newMnemonicAccount.mnemonic) && (!newPrivateKeyAccount.accountName || !newPrivateKeyAccount.privateKey)) {
      navigateBack(-3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <Password
        onSubmit={async (data) => {
          const accountId = uuidv4();

          await setExtensionStorage('encryptedPassword', sha512(data.password));

          if (newMnemonicAccount.accountName && newMnemonicAccount.mnemonic) {
            navigate('/account/initialize/complete');

            await setExtensionStorage('accounts', [
              ...extensionStorage.accounts,
              {
                id: accountId,
                type: 'MNEMONIC',
                bip44: { addressIndex: `${newMnemonicAccount.addressIndex}` },
                encryptedMnemonic: aesEncrypt(newMnemonicAccount.mnemonic, data.password),
                encryptedPassword: aesEncrypt(data.password, newMnemonicAccount.mnemonic),
                encryptedRestoreString: sha512(newMnemonicAccount.mnemonic),
              },
            ]);

            await setExtensionStorage('selectedAccountId', accountId);

            await setExtensionStorage('accountName', { ...extensionStorage.accountName, [accountId]: newMnemonicAccount.accountName });

            await setExtensionStorage('selectedChainId', extensionStorage.allowedChainIds[0]);

            await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
          } else if (newPrivateKeyAccount.accountName && newPrivateKeyAccount.privateKey) {
            navigate('/account/initialize/complete');

            await setExtensionStorage('accounts', [
              ...extensionStorage.accounts,
              {
                id: accountId,
                type: 'PRIVATE_KEY',
                encryptedPrivateKey: aesEncrypt(newPrivateKeyAccount.privateKey, data.password),
                encryptedPassword: aesEncrypt(data.password, newPrivateKeyAccount.privateKey),
                encryptedRestoreString: sha512(newPrivateKeyAccount.privateKey),
              },
            ]);

            await setExtensionStorage('selectedAccountId', accountId);

            await setExtensionStorage('accountName', { ...extensionStorage.accountName, [accountId]: newPrivateKeyAccount.accountName });

            await setExtensionStorage('selectedChainId', extensionStorage.allowedChainIds[0]);

            await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);
          } else {
            navigateBack(-3);
          }
        }}
      />
    </Container>
  );
}

// million reflect vital fatal couple reform banner rate step glad ranch exact
