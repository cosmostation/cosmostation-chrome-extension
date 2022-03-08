import { useAccountSWR } from '~/Popup/hooks/SWR/cosmos/useAccountSWR';
import { useDelegationSWR } from '~/Popup/hooks/SWR/cosmos/useDelegationSWR';
import { useUndelegationSWR } from '~/Popup/hooks/SWR/cosmos/useUndelegationSWR';
import { plus } from '~/Popup/utils/big';
import {
  calculatingDelegatedVestingTotal,
  getDelegatedVestingTotal,
  getPersistenceVestingRelatedBalances,
  getVestingRelatedBalances,
  getVestingRemained,
} from '~/Popup/utils/cosmosVesting';
import type { CosmosChain } from '~/types/chain';

export function useAmountSWR(chain: CosmosChain, suspense?: boolean) {
  const account = useAccountSWR(chain, suspense);
  const delegation = useDelegationSWR(chain, suspense);
  const undelegation = useUndelegationSWR(chain, suspense);

  const delegationAmount =
    delegation.data
      ?.filter((item) => item.amount?.denom === chain.baseDenom)
      ?.reduce((ac, cu) => plus(ac, cu.amount.amount), '0')
      .toString() || '0';

  const vestingRemained = getVestingRemained(account.data, chain.baseDenom);
  const delegatedVestingTotal =
    chain.chainName === 'kava' ? getDelegatedVestingTotal(account.data, chain.baseDenom) : calculatingDelegatedVestingTotal(vestingRemained, delegationAmount);
}
