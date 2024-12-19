import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import { Container } from './styled';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  console.log('🚀 ~ Sui ~ currentCoin:', currentCoin);

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
