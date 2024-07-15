import { useMemo } from 'react';

import { LEDGER_SUPPORT_COIN_TYPE } from '~/constants/ledger';
import type { CosmosChain } from '~/types/chain';

import { useCurrentAccount } from './useCurrent/useCurrentAccount';

export function useEthermintLedgerSign(chain: CosmosChain) {
  const { currentAccount } = useCurrentAccount();

  const isLedgerAccount = useMemo(() => currentAccount.type === 'LEDGER', [currentAccount.type]);
  const isEthermintChain = useMemo(() => chain.bip44.coinType === LEDGER_SUPPORT_COIN_TYPE.ETHERMINT, [chain.bip44.coinType]);

  const isEthermintLedgerSign = useMemo(() => isLedgerAccount && isEthermintChain, [isEthermintChain, isLedgerAccount]);

  const isInjectiveChain = useMemo(() => chain.id.startsWith('injective'), [chain.id]);

  return { isEthermintLedgerSign, isInjectiveChain };
}
