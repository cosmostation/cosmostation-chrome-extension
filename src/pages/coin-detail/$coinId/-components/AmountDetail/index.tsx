import Bitcoin from './Bitcoin';

type AmountDetailProps = {
  uniqueCoinId: string;
};

export default function AmountDetail({ uniqueCoinId }: AmountDetailProps) {
  // const currentCoin
  // const chainType: ChainType = currentCoin.chainType;
  // const isStakingCoin(혹은 isMainCoin)

  // if (chainType === 'cosmos' && isStakingCoin) {
  //   return <Cosmos uniqueCoinId={uniqueCoinId} />;
  // }

  // if (currentChain.line === 'sui' && isStakingCoin) {
  //   return <Sui uniqueCoinId={uniqueCoinId} />;
  // }

  // if (currentChain.line === 'bitcoin' && isStakingCoin) {
  //   return <Sui uniqueCoinId={uniqueCoinId} />;
  // }

  // return null;

  return <Bitcoin uniqueCoinId={uniqueCoinId} />;
}
