import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CoinSelect from '@/components/CoinSelect';
import { Route as Stake } from '@/pages/wallet/stake/$coinId';

export default function Entry() {
  const navigate = useNavigate();

  return (
    <BaseBody>
      <EdgeAligner>
        <CoinSelect
          variant="stake"
          onSelectCoin={(coinId) => {
            navigate({
              to: Stake.to,
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
