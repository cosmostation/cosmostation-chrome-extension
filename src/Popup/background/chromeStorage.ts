import { CHAINS, ETHEREUM_NETWORKS } from '~/constants/chain';
import { getAllStorage } from '~/Popup/utils/chromeStorage';
import { aesDecrypt, mnemonicToPair, privateKeyToPair, sha512 } from '~/Popup/utils/crypto';

export async function chromeStorage() {
  const storage = await getAllStorage();

  const { accounts, selectedAccountId, additionalEthereumNetworks, encryptedPassword } = storage;

  const currentAccount = (() => accounts.find((account) => account.id === selectedAccountId)!)();

  const currentEthereumNetwork = (() => {
    const account = currentAccount;

    const ethereumNetworks = [...ETHEREUM_NETWORKS, ...additionalEthereumNetworks];

    return ethereumNetworks.find((network) => network.id === account.selectedEthereumNetworkId)!;
  })();

  const getPairKey = (chainName: string, password: string) => {
    const chains = Object.values(CHAINS);
    const selectedChain = chains.find((chain) => chain.chainName === chainName);

    if (!selectedChain) {
      throw new Error('not exist chain');
    }

    if (encryptedPassword !== sha512(password)) {
      throw new Error('incorrect password');
    }

    if (currentAccount.type === 'MNEMONIC') {
      const { purpose, coinType, account, change } = selectedChain.bip44;
      const path = `m/${purpose}/${coinType}/${account}/${change}/${currentAccount.bip44.addressIndex}`;

      return mnemonicToPair(aesDecrypt(currentAccount.encryptedMnemonic, password), path);
    }

    return privateKeyToPair(Buffer.from(aesDecrypt(currentAccount.encryptedPrivateKey, password), 'hex'));
  };

  return {
    storage,
    currentAccount,
    currentEthereumNetwork,
    getPairKey,
  };
}
