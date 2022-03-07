import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import ChainItem from '~/Popup/pages/Dashboard/components/ChainItem';
import type { EthereumChain } from '~/types/chain';

type EthereumChainItemProps = {
  chain: EthereumChain;
};

export default function EthereumChainItem({ chain }: EthereumChainItemProps) {
  const { currentNetwork } = useCurrentNetwork();

  const { decimals, networkName, coingeckoId, displayDenom } = currentNetwork;
  const { chainName, imageURL } = chain;
  return (
    <ChainItem
      chainName={`${chainName} (${networkName})`}
      decimals={decimals}
      coinGeckoId={coingeckoId}
      amount="2"
      displayDenom={displayDenom}
      imageURL={imageURL}
    />
  );
}
