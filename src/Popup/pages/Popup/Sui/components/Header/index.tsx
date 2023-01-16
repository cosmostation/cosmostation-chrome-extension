import { SUI } from '~/constants/chain/sui/sui';
import PopupHeader from '~/Popup/components/PopupHeader';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentPassword } from '~/Popup/hooks/useCurrent/useCurrentPassword';
import { getAddress, getKeyPair } from '~/Popup/utils/common';
import type { SuiNetwork } from '~/types/chain';

type HeaderProps = {
  network?: SuiNetwork;
  origin?: string;
  className?: string;
};

export default function Header({ network, origin, className }: HeaderProps) {
  const chain = SUI;
  const { currentAccount } = useCurrentAccount();

  const { currentPassword } = useCurrentPassword();

  const keyPair = getKeyPair(currentAccount, chain, currentPassword);
  const address = getAddress(chain, keyPair?.publicKey);

  const chainName = (() => {
    if (network) {
      return network.networkName;
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
