import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import { Container } from './styled';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  console.log('🚀 ~ Cosmos ~ currentCoin:', currentCoin);

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StakeDetailBox coinId={coinId} />
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
