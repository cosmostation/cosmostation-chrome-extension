import { getAccountAddress } from '@/libs/account';
import type { AccountAddress } from '@/types/account';
import type { ChainType, ChainTypeMap } from '@/types/chain';
import type { BalanceFetchOption } from '@/types/message/service-worker/updateRequest';
import { createChainMap } from '@/utils/cache/chainMap';
import { gt, minus } from '@/utils/numbers';
import { getUniqueChainIdWithManual } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';

import { getDefaultVisibleAsset } from './defaultVisibleAssets';

export async function getFilteredAccountAddresses<T extends ChainType>(
  accountId: string,
  chainType: T,
  { isMinimal = false, chainId, priority }: BalanceFetchOption = {},
): Promise<(AccountAddress & { chain: ChainTypeMap[T] })[]> {
  const [accountAddress, chainMapInstance] = await Promise.all([getAccountAddress(accountId), createChainMap(chainType)]);

  if (priority) {
    const filteredChainIds = await getChainIdsByBalancePriority(accountId, chainType, priority);

    return accountAddress
      .map((address) => {
        const uniqueId = getUniqueChainIdWithManual(address.chainId, address.chainType);

        if (filteredChainIds?.has(uniqueId)) {
          const chain = chainMapInstance?.get(uniqueId);
          return chain ? { ...address, chain: chain as ChainTypeMap[T] } : null;
        }
        return null;
      })
      .filter((item) => !!item);
  }

  const isUpdateSpecificAddress = !!chainId;

  const defaultChains = isMinimal ? getDefaultVisibleAsset(chainType) : undefined;

  const addressList = defaultChains
    ? accountAddress.filter((addr) => defaultChains.some((chain) => chain.chainId === addr.chainId && chain.chainType === addr.chainType))
    : isUpdateSpecificAddress
      ? accountAddress.filter((addr) => getUniqueChainIdWithManual(addr.chainId, addr.chainType) === chainId)
      : accountAddress;

  const targetChain = chainId && chainMapInstance?.get(chainId);

  return addressList
    .map((addr) => {
      const chain = targetChain || chainMapInstance?.get(getUniqueChainIdWithManual(addr.chainId, addr.chainType));
      return chain ? { ...addr, chain: chain as ChainTypeMap[T] } : null;
    })
    .filter((item) => !!item);
}

export async function getChainIdsByBalancePriority(id: string, chainType: ChainType, priority: 'high' | 'low') {
  if (chainType === 'evm') {
    const evmBalanceData = (await getExtensionLocalStorage(`${id}-balance-evm`)) || [];

    const filteredChainIds = new Set(
      evmBalanceData
        .filter((data) => {
          const hasBalance = gt(BigInt(data.balance).toString(), '0');
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'cosmos') {
    const cosmosBalanceData = (await getExtensionLocalStorage(`${id}-balance-cosmos`)) || [];

    const filteredChainIds = new Set(
      cosmosBalanceData
        .filter((data) => {
          const hasBalance = data.balances.length > 0;
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'bitcoin') {
    const bitcoinBalance = (await getExtensionLocalStorage(`${id}-balance-bitcoin`)) || [];

    const filteredChainIds = new Set(
      bitcoinBalance
        .filter((data) => {
          const balance =
            data?.balance.chainStats && data?.balance.mempoolStats
              ? minus(minus(data?.balance.chainStats?.funded_txo_sum, data?.balance.chainStats?.spent_txo_sum), data?.balance.mempoolStats?.spent_txo_sum)
              : '0';

          const hasBalance = gt(balance, '0');

          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'aptos') {
    const aptosBalance = (await getExtensionLocalStorage(`${id}-balance-aptos-v2`)) || [];

    const filteredChainIds = new Set(
      aptosBalance
        .filter((data) => {
          const hasBalance = data.balances.length > 0;
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'sui') {
    const suiBalance = (await getExtensionLocalStorage(`${id}-balance-sui`)) || [];

    const filteredChainIds = new Set(
      suiBalance
        .filter((data) => {
          const hasBalance = data.balances.length > 0;
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'iota') {
    const iotaBalance = (await getExtensionLocalStorage(`${id}-balance-iota`)) || [];

    const filteredChainIds = new Set(
      iotaBalance
        .filter((data) => {
          const hasBalance = data.balances.length > 0;
          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'gno') {
    const gnoBalance = (await getExtensionLocalStorage(`${id}-balance-gno`)) || [];

    const filteredChainIds = new Set(
      gnoBalance
        .filter((data) => {
          const hasBalance = gt(data.balance, '0');

          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }

  if (chainType === 'solana') {
    const solanaBalance = (await getExtensionLocalStorage(`${id}-balance-solana`)) || [];

    const filteredChainIds = new Set(
      solanaBalance
        .filter((data) => {
          const hasBalance = gt(data.balance, '0');

          return priority === 'high' ? hasBalance : !hasBalance;
        })
        .map((item) => getUniqueChainIdWithManual(String(item.chainId), item.chainType)),
    );

    return filteredChainIds;
  }
}
