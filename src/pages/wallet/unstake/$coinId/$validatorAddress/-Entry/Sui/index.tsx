import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import Fee from '@/components/Fee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { Route as TxResult } from '@/pages/wallet/tx-result/$txHash/$coinId';
import { times, toDisplayDenomAmount } from '@/utils/numbers';
import { getCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import UnstakingItem from './components/UnstakingItem';
import { ChainNameContainer, CoinContainer, CoinImage, CoinSymbolText, Divider } from './styled';

type SuiProps = {
  coinId: string;
  // FIXME 로직 확인 후 오브젝트 id를 받아야 하면 해당 라우트로 수정
  // validatorAddress: string;
};

// TODO i18라우팅 처리 작업 필요
export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useAccountAssets();
  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const parsedCoinId = parseCoinId(coinId);

  const selectedUnstakingCoin = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'sui') {
      return data.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  const coinImageURL = selectedUnstakingCoin?.asset.image || '';

  const coinSymbol = selectedUnstakingCoin?.asset.symbol || '';
  const coinDecimal = selectedUnstakingCoin?.asset.decimals || 0;
  const coinGeckoId = selectedUnstakingCoin?.asset.coinGeckoId || '';

  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const chainName = selectedUnstakingCoin?.chain.name || '';

  const baseAvailableAmount = selectedUnstakingCoin?.balance || '0';

  console.log('🚀 ~ Cosmos ~ baseAvailableAmount:', baseAvailableAmount);

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const dummyUnstakingItems = {
    validatorName: 'Cosmostation',
    objectId: '0x69bed13306e0a48590c695ef8b967177f039394279624faab0f984d03a17acfa',
    symbol: coinSymbol,
    decimals: coinDecimal,
    unstakeAmount: '70',
    stakedAmount: '100',
    earnedAmount: '900',
    startEarningEpoch: '600',
    validatorImage: 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png',
  };

  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} />
            <CoinSymbolText variant="h2_B">{`${coinSymbol} ${t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstake')}`}</CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.stakingCoin', {
                  chainName: chainName,
                })}
              </Typography>
            </ChainNameContainer>
          </CoinContainer>
          <UnstakingItem
            validatorImage={dummyUnstakingItems.validatorImage}
            validatorName={dummyUnstakingItems.validatorName}
            objectId={dummyUnstakingItems.objectId}
            symbol={dummyUnstakingItems.symbol}
            decimals={dummyUnstakingItems.decimals}
            unstakedAmount={dummyUnstakingItems.unstakeAmount}
            unstakedValue={times(toDisplayDenomAmount(dummyUnstakingItems.unstakeAmount, coinDecimal), coinPrice)}
            stakedAmount={dummyUnstakingItems.stakedAmount}
            earnedAmount={dummyUnstakingItems.earnedAmount}
          />
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Sui.index.inform')}</Typography>}
            body={
              <Typography variant="b4_R_Multiline">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Sui.index.informDescription', {
                  symbol: coinSymbol,
                })}
              </Typography>
            }
          />

          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          <Fee
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          />
        </>
      </BaseFooter>
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakeReview')}
        contentsSubTitle={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakeReviewDescription')}
        confirmButtonText={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstake')}
        onClickCancel={() => {
          console.log('onClickCancel');
        }}
        onClickConfirm={() => {
          navigate({
            to: TxResult.to,
            params: {
              coinId,
              txHash: 'BE8D07E79F4F74C64C2F672621FF05A6CA13F3541AFAD36F8C7037D28B2C05C4',
            },
          });
        }}
      />
    </>
  );
}
