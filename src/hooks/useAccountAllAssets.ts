import PromisePool from '@supercharge/promise-pool';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { getAssets } from '@/libs/asset';
import { getChains } from '@/libs/chain';
import type { AccountAptosAsset, AccountCosmosAsset, AccountCw20Asset, AccountErc20Asset, AccountEvmAsset, AccountSuiAsset } from '@/types/account';
import type { AccountAssets as AccountAllAssets } from '@/types/accountAssets';
import type { ExtensionStorage } from '@/types/extension';

import { useCurrentAccount } from './useCurrentAccount';

type UseAccountAllAssets =
  | {
      accountId?: string;
      config?: UseQueryOptions<AccountAllAssets | null>;
    }
  | undefined;

export function useAccountAllAssets({ accountId, config }: UseAccountAllAssets = {}) {
  const { currentAccount } = useCurrentAccount();

  const param = accountId || currentAccount.id;

  const fetcher = async () => {
    try {
      const concurrency = 10;
      const storage = await chrome.storage.local.get<ExtensionStorage>([
        `${param}-address`,
        `${param}-balance-cosmos`,
        `${param}-balance-evm`,
        `${param}-balance-aptos`,
        `${param}-balance-sui`,
        `${param}-balance-erc20`,
        `${param}-balance-cw20`,
      ]);
      const { aptosChains, cosmosChains, evmChains, suiChains } = await getChains();
      const { aptosAssets, cosmosAssets, cw20Assets, erc20Assets, evmAssets, suiAssets } = await getAssets();

      const accountAddress = storage[`${param}-address`];

      const cosmosBalances = storage[`${param}-balance-cosmos`];
      const evmBalances = storage[`${param}-balance-evm`];
      const aptosBalances = storage[`${param}-balance-aptos`];
      const suiBalances = storage[`${param}-balance-sui`];
      const erc20Balances = storage[`${param}-balance-erc20`];
      const cw20Balances = storage[`${param}-balance-cw20`];

      const cosmosPromise = PromisePool.withConcurrency(concurrency)
        .for(cosmosAssets)
        .process(async (asset) => {
          const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
          const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

          const { results } = await PromisePool.withConcurrency(concurrency)
            .for(addresses)
            .process((address) => {
              const type = asset.id;
              const balanceInfo = cosmosBalances?.find(
                (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
              );
              const balance = balanceInfo?.balances?.find((balance) => balance.denom === type)?.amount || '0';

              const result: AccountCosmosAsset = {
                chain,
                asset,
                address,
                balance: balance,
              };

              return result;
            });

          return results;
        });

      const cw20Promise = PromisePool.withConcurrency(concurrency)
        .for(cw20Assets)
        .process(async (asset) => {
          const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
          const chain = cosmosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

          const { results } = await PromisePool.withConcurrency(concurrency)
            .for(addresses)
            .process((address) => {
              const type = asset.id;
              const balanceInfo = cw20Balances?.find(
                (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
              );
              const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

              const result: AccountCw20Asset = {
                chain,
                asset,
                address,
                balance: balance,
              };

              return result;
            });

          return results;
        });

      const evmPromise = PromisePool.withConcurrency(concurrency)
        .for(evmAssets)
        .process(async (asset) => {
          const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
          const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

          const { results } = await PromisePool.withConcurrency(concurrency)
            .for(addresses)
            .process((address) => {
              const balanceInfo = evmBalances?.find(
                (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
              );

              const balance = balanceInfo?.balance ? BigInt(balanceInfo?.balance).toString() : '0';

              const result: AccountEvmAsset = {
                chain,
                asset,
                address,
                balance: balance,
              };

              return result;
            });

          return results;
        });

      const erc20Promise = PromisePool.withConcurrency(concurrency)
        .for(erc20Assets)
        .process(async (asset) => {
          const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
          const chain = evmChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

          const { results } = await PromisePool.withConcurrency(concurrency)
            .for(addresses)
            .process((address) => {
              const type = asset.id;
              const balanceInfo = erc20Balances?.find(
                (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
              );
              const balance = balanceInfo?.balances?.find((balance) => balance.contract === type)?.balance || '0';

              const result: AccountErc20Asset = {
                chain,
                asset,
                address,
                balance: balance,
              };

              return result;
            });

          return results;
        });

      const aptosPromise = PromisePool.withConcurrency(concurrency)
        .for(aptosAssets)
        .process(async (asset) => {
          const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
          const chain = aptosChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

          const { results } = await PromisePool.withConcurrency(concurrency)
            .for(addresses)
            .process((address) => {
              const type = `0x1::coin::CoinStore<${asset.id}>`;
              const balanceInfo = aptosBalances?.find(
                (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
              );
              const balance = balanceInfo?.balances?.find((balance) => balance.type === type)?.data?.coin?.value || '0';
              const result: AccountAptosAsset = {
                chain,
                asset,
                address,
                balance: balance,
              };

              return result;
            });

          return results;
        });

      const suiPromise = PromisePool.withConcurrency(concurrency)
        .for(suiAssets)
        .process(async (asset) => {
          const addresses = accountAddress.filter((address) => address.chainId === asset.chainId && address.chainType === asset.chainType);
          const chain = suiChains.find((chain) => chain.id === asset.chainId && chain.chainType === asset.chainType)!;

          const { results } = await PromisePool.withConcurrency(concurrency)
            .for(addresses)
            .process((address) => {
              const type = asset.id;
              const balanceInfo = suiBalances?.find(
                (balance) => balance.chainId === address.chainId && balance.chainType === address.chainType && balance.address === address.address,
              );
              const balance = balanceInfo?.balances?.find((balance) => balance.coinType === type)?.totalBalance || '0';
              const result: AccountSuiAsset = {
                chain,
                asset,
                address,
                balance: balance,
              };

              return result;
            });

          return results;
        });

      const results = await Promise.all([cosmosPromise, evmPromise, aptosPromise, suiPromise, cw20Promise, erc20Promise]);

      const cosmosAccountAssets = results[0].results.flat().filter((asset) => asset.chain && asset.address);
      const evmAccountAssets = results[1].results.flat().filter((asset) => asset.chain && asset.address);
      const aptosAccountAssets = results[2].results.flat().filter((asset) => asset.chain && asset.address);
      const suiAccountAssets = results[3].results.flat().filter((asset) => asset.chain && asset.address);
      const cw20AccountAssets = results[4].results.flat().filter((asset) => asset.chain && asset.address);
      const erc20AccountAssets = results[5].results.flat().filter((asset) => asset.chain && asset.address);

      console.timeEnd('getAccountAssets');

      return { cosmosAccountAssets, evmAccountAssets, aptosAccountAssets, suiAccountAssets, cw20AccountAssets, erc20AccountAssets };
    } catch {
      return null;
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['accountAllAssets', param],
    queryFn: fetcher,
    enabled: !!param,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
    ...config,
  });

  return { data, isLoading, error, refetch };
}
