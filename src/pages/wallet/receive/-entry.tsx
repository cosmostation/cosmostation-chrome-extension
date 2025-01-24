import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { Route as Receive } from '@/pages/wallet/receive/$coinId';

export default function Entry() {
  const navigate = useNavigate();
  const { data: accountAllAssets } = useAccountAllAssets({
    filterByPreferAccountType: true,
  });

  return (
    <BaseBody>
      <EdgeAligner>
        <CoinSelect
          coinList={accountAllAssets?.flatAccountAssets}
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
