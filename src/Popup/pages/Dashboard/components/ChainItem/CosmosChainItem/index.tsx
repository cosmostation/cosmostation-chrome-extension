import ChainItem from '~/Popup/pages/Dashboard/components/ChainItem';
import type { CosmosChain } from '~/types/chain';

type CosmosChainItemProps = {
  chain: CosmosChain;
  onClick?: () => void;
};

export default function CosmosChainItem({ chain, onClick }: CosmosChainItemProps) {
  const { chainName, decimals, displayDenom, coingeckoId, imageURL } = chain;

  return (
    <ChainItem
      onClick={onClick}
      chainName={chainName}
      amount="1"
      decimals={decimals}
      displayDenom={displayDenom}
      coinGeckoId={coingeckoId}
      imageURL={imageURL}
    />
  );
}
