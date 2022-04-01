import type { EthereumChain } from '~/types/chain';

type EthereumProps = {
  chain: EthereumChain;
};

export default function Ethereum({ chain }: EthereumProps) {
  return <div>{chain.chainName}</div>;
}
