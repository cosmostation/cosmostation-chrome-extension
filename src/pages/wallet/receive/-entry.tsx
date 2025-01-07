import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { Route as Receive } from '@/pages/wallet/receive/$coinId';

// NOTE !! receive에서는 히든처리 안된 모든 코인,체인에 대해서 선택이 가능하고 또 주소를 볼 수 있어야한다.
export default function Entry() {
  const navigate = useNavigate();

  return (
    <BaseBody>
      <EdgeAligner>
        <CoinSelect
          onSelectCoin={(coinId) => {
            navigate({
              to: Receive.to,
              params: {
                coinId: coinId,
              },
            });
          }}
        />
      </EdgeAligner>
    </BaseBody>
  );
}
