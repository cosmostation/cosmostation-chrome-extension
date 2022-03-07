import ChainItem from '~/Popup/pages/Dashboard/components/ChainItem';
import type { CosmosChain } from '~/types/chain';

type CosmosChainItemProps = {
  chain: CosmosChain;
};

export default function CosmosChainItem({ chain }: CosmosChainItemProps) {
  const { chainName, decimals, displayDenom, coingeckoId, imageURL } = chain;

  return <ChainItem chainName={chainName} amount="1" decimals={decimals} displayDenom={displayDenom} coinGeckoId={coingeckoId} imageURL={imageURL} />;
}
