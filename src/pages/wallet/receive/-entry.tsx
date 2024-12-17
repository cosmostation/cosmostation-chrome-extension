import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { Route as Receive } from '@/pages/wallet/receive/$coinId';

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
