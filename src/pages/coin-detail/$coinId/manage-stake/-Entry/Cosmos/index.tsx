import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  return <div>{currentCoin?.address.address}</div>;
}
