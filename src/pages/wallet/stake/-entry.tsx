import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { Route as Send } from '@/pages/wallet/send/$coinId';

export default function Entry() {
  const navigate = useNavigate();

  return (
    <BaseBody>
      <EdgeAligner>
        {/* TODO 스테이킹 코인 셀렉터로 변경 필요. */}
        <CoinSelect
          onSelectCoin={(coinId) => {
            navigate({
              to: Send.to,
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
