import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { Route as Swap } from '@/pages/wallet/swap/$coinId';

export default function Entry() {
  const navigate = useNavigate();

  // TODO 스왑 가능한 코인 리스팅.
  return (
    <BaseBody>
      <EdgeAligner>
        <CoinSelect
          onSelectCoin={(coinId) => {
            navigate({
              to: Swap.to,
              params: {
                coinId,
              },
            });
          }}
        />
      </EdgeAligner>
    </BaseBody>
  );
}
