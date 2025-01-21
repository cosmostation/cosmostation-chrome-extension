import { BITCOIN } from '~/constants/chain/bitcoin/bitcoin';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import type { BitcoinChain } from '~/types/chain';

type HeaderProps = {
  network?: BitcoinChain;
  origin?: string;
  className?: string;
};

export default function Header({ network, origin, className }: HeaderProps) {
  const chain = network || BITCOIN;
  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const chainName = (() => {
    if (network) {
      return network.chainName;
    }

    return chain.chainName;
  })();

  const chainImageURL = (() => {
    if (network) {
      return network.imageURL;
    }

    return chain.imageURL;
  })();

  return <PopupHeader account={{ ...currentAccount, address }} chain={{ name: chainName, imageURL: chainImageURL }} origin={origin} className={className} />;
}
