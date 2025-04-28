import { useMemo } from 'react';

import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useMultipleAccountTypes } from '@/hooks/useMultipleAccountTypes';
import type { ChainToAccountTypeMap } from '@/types/account';
import type { ChainAccountType } from '@/types/chain';
import { gt, plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CoinType from './components/CoinType';
import { CoinTypeSelectorContainer } from './styled';

type CoinTypeSelectorProps = {
  accountId: string;
  currentPreferAccountTypes: ChainToAccountTypeMap;
  variant?: 'default' | 'filtered';
  onClickChainType: (id: string, accountType: ChainAccountType) => void;
};

export default function CoinTypeSelector({ accountId, currentPreferAccountTypes, variant = 'default', onClickChainType }: CoinTypeSelectorProps) {
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();
  const { data: multipleAccountTypeWithAddress } = useMultipleAccountTypes({ accountId });
  const { data: accountAllAssets } = useAccountAllAssets({ accountId });
  const { data: coinGeckoData } = useCoinGeckoPrice();

  const mappedMultipleAccountTypes = useMemo(() => {
    if (multipleAccountTypeWithAddress && flatChainList) {
      const multipleAccountTypes = Object.values(multipleAccountTypeWithAddress);
      const mappedAccountTypes = multipleAccountTypes.map((item) => {
        const chain = flatChainList.find((chain) => chain.id === item[0].chainId && chain.chainType === item[0].chainType)!;

        return {
          chain,
          accountTypes: item.map((i) => {
            const address = i.address;

            if (chain?.chainType === 'cosmos') {
              const filteredCosmosAssets = accountAllAssets?.cosmosAccountAssets.filter((asset) => asset.address.address === address);
              const filteredCW20Assets = accountAllAssets?.cw20AccountAssets.filter((asset) => asset.address.address === address);

              const cosmosValueSum =
                filteredCosmosAssets?.reduce((totalValue, cur) => {
                  const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
                  const assetValue = times(toDisplayDenomAmount(cur.totalBalance || cur.balance || '0', cur.asset.decimals), assetPrice);
                  return plus(totalValue, assetValue);
                }, '0') || '0';

              const cw20ValueSum =
                filteredCW20Assets?.reduce((totalValue, cur) => {
                  const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
                  const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);

                  return plus(totalValue, assetValue);
                }, '0') || '0';

              const totalAssetValue = plus(cosmosValueSum, cw20ValueSum);

              const isHaveBalance =
                filteredCosmosAssets?.some((item) => gt(item.totalBalance || item.balance || '0', '0')) ||
                filteredCW20Assets?.some((item) => gt(item.balance, '0'));

              return {
                accountType: i.accountType,
                address: i.address,
                totalAssetValue,
                isHaveBalance: isHaveBalance || false,
              };
            }

            if (chain?.chainType === 'bitcoin') {
              const filteredBitcoinAssets = accountAllAssets?.bitcoinAccountAssets.filter((asset) => asset.address.address === address);

              const bitcoinValueSum =
                filteredBitcoinAssets?.reduce((totalValue, cur) => {
                  const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;
                  const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);
                  return plus(totalValue, assetValue);
                }, '0') || '0';

              const totalAssetValue = bitcoinValueSum;

              const isHaveBalance = filteredBitcoinAssets?.some((item) => gt(item.balance, '0')) || false;

              return {
                accountType: i.accountType,
                address: i.address,
                totalAssetValue,
                isHaveBalance,
              };
            }

            return {
              accountType: i.accountType,
              address: i.address,
              totalAssetValue: '0',
              isHaveBalance: false,
            };
          }),
        };
      });
      return mappedAccountTypes;
    }
    return [];
  }, [
    accountAllAssets?.bitcoinAccountAssets,
    accountAllAssets?.cosmosAccountAssets,
    accountAllAssets?.cw20AccountAssets,
    coinGeckoData,
    userCurrencyPreference,
    flatChainList,
    multipleAccountTypeWithAddress,
  ]);

  const filteredAccountTypes = useMemo(() => {
    if (variant === 'filtered') {
      return mappedMultipleAccountTypes.filter((item) => item.accountTypes.some((account) => account.accountType.isDefault === false && account.isHaveBalance));
    }

    return mappedMultipleAccountTypes;
  }, [mappedMultipleAccountTypes, variant]);

  return (
    <CoinTypeSelectorContainer>
      {filteredAccountTypes.map((item, i) => (
        <CoinType
          key={i}
          accountId={accountId}
          chain={item.chain}
          selectedAccountType={currentPreferAccountTypes[item.chain.id]}
          accountTypeDetails={item.accountTypes}
          onClickChainType={onClickChainType}
        />
      ))}
    </CoinTypeSelectorContainer>
  );
}
