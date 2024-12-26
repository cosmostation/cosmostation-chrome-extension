import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import CoinType from '@/components/CoinTypeSelector/-components/CoinType';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { useMultipleAccountTypes } from '@/hooks/useMultipleAccountTypes';
import type { Chain, ChainAccountType } from '@/types/chain';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, ChainImage, CoinTypeContainer, Container, DescriptionContainer, Header, HeaderTitle, StyledBottomSheet, StyledButton } from './styled';

import Close24Icon from 'assets/images/icons/Close24.svg';

import DefaultChain from '@/assets/images/chain/defaultChain.png';

type CoinTypeBottomSheetProps = Omit<React.ComponentProps<typeof StyledBottomSheet>, 'children'> & {
  chain: Chain;
  onClickChainType?: (id: string, accountType: ChainAccountType) => void;
};

export default function CoinTypeBottomSheet({ chain, onClose, onClickChainType, ...remainder }: CoinTypeBottomSheetProps) {
  const { t } = useTranslation();

  const { currency } = useExtensionStorageStore((state) => state);

  const { currentAccount } = useCurrentAccount();
  const { currentPreferAccountType } = useCurrentPreferAccountTypes();
  const { flatChainList } = useChainList();
  const { data: multipleAccountTypeWithAddress } = useMultipleAccountTypes();
  const { data: accountAllAssets } = useAccountAllAssets();
  const { data: coinGeckoData } = useCoinGeckoPrice();
  const selectedAccountType = currentPreferAccountType[chain?.id || ''];

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

  const matchedAccountType = mappedMultipleAccountTypes.find((item) => item.chain.id === chain?.id);

  return (
    <StyledBottomSheet
      {...remainder}
      onClose={() => {
        onClose?.({}, 'backdropClick');
      }}
    >
      <Container>
        <Header>
          <HeaderTitle>
            <ChainImage src={chain.image} defaultImgSrc={DefaultChain} />
            <Typography variant="h2_B">
              {t('pages.manage-assets.switch-account-type.components.coinTypeBottomSheet.index.coinType', {
                chainName: chain.name,
              })}
            </Typography>
          </HeaderTitle>
          <StyledButton
            onClick={() => {
              onClose?.({}, 'escapeKeyDown');
            }}
          >
            <Close24Icon />
          </StyledButton>
        </Header>
        <Body>
          <DescriptionContainer>
            <Typography variant="b3_R_Multiline">{t('pages.manage-assets.switch-account-type.components.coinTypeBottomSheet.index.description')}</Typography>
          </DescriptionContainer>
          <CoinTypeContainer>
            <CoinType
              accountId={currentAccount.id}
              chain={chain}
              selectedAccountType={selectedAccountType}
              accountTypeDetails={matchedAccountType?.accountTypes || []}
              onClickChainType={(id, accountType) => {
                onClickChainType?.(id, accountType);
              }}
              isDisableTopContents
            />
          </CoinTypeContainer>
        </Body>
      </Container>
    </StyledBottomSheet>
  );
}
