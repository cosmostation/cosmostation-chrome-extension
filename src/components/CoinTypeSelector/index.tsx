import { useMemo } from 'react';

import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCoinGeckoPriceSWR } from '@/hooks/useCoinGeckoPrice';
import { useMultipleAccountTypes } from '@/hooks/useMultipleAccountTypes';
import type { ChainAccountType } from '@/types/chain';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CoinType from './-components/CoinType';
import { CoinTypeSelectorContainer } from './styled';

type CoinTypeSelectorProps = {
  accountId: string;
  currentPreferAccountTypes: Record<string, ChainAccountType>;
  variant?: 'default' | 'filtered';
  onClickChainType: (id: string, accountType: ChainAccountType) => void;
};

export default function CoinTypeSelector({ accountId, currentPreferAccountTypes, variant = 'default', onClickChainType }: CoinTypeSelectorProps) {
  const { currency } = useExtensionStorageStore((state) => state);

  const { flatChainList } = useChainList();
  const { multipleAccountTypeWithAddress } = useMultipleAccountTypes({ accountId });
  const { data: accountAllAssets } = useAccountAllAssets({ accountId });
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

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
                  const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[currency]) || 0;
                  const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);
                  return plus(totalValue, assetValue);
                }, '0') || '0';

              const cw20ValueSum =
                filteredCW20Assets?.reduce((totalValue, cur) => {
                  const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[currency]) || 0;
                  const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);

                  return plus(totalValue, assetValue);
                }, '0') || '0';

              const totalAssetValue = plus(cosmosValueSum, cw20ValueSum);

              return {
                accountType: i.accountType,
                address: i.address,
                totalAssetValue,
              };
            }
            return {
              accountType: i.accountType,
              address: i.address,
              totalAssetValue: '0',
            };
          }),
        };
      });
      return mappedAccountTypes;
    }
    return [];
  }, [accountAllAssets?.cosmosAccountAssets, accountAllAssets?.cw20AccountAssets, coinGeckoData, currency, flatChainList, multipleAccountTypeWithAddress]);

  const filteredAccountTypes = useMemo(() => {
    if (variant === 'filtered') {
      return mappedMultipleAccountTypes.filter((item) => item.accountTypes.some((account) => account.totalAssetValue !== '0'));
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
