import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  return <div>{currentCoin?.address.address}</div>;
}
