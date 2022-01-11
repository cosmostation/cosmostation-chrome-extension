import { ToggleButton } from '@mui/material';

import { useCosmosBalance } from '~/Popup/hooks/SWR/cosmos/useCosmosBalance';
import { toDisplayDenomAmount } from '~/Popup/utils/big';
import type { CosmosChain } from '~/types/chain';

type ChainToggleButtonProps = {
  chain: CosmosChain;
  address: string;
};

// TODO: 이더리움 / 코스모스 분리 해야함
export default function ChainToggleButton({ chain, address }: ChainToggleButtonProps) {
  const { data } = useCosmosBalance({ chain, address });

  const balance = data?.result.find((value) => value.denom === chain.baseDenom)?.amount || '0';

  return (
    <ToggleButton value={chain.id}>
      {chain.chainName}
      {toDisplayDenomAmount(balance, chain.decimal)}
    </ToggleButton>
  );
}
