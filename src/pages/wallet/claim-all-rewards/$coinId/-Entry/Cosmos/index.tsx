import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
// import Fee from '@/components/Fee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { DUMMY_REWARDS } from '@/constants/test';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCoinList } from '@/hooks/useCoinList';
import { Route as TxResult } from '@/pages/wallet/tx-result';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import {
  ChainNameContainer,
  CoinContainer,
  CoinImage,
  CoinImageContainer,
  CoinSymbolText,
  Divider,
  EstimatedValueTextContainer,
  InformationPanelBody,
  InputWrapper,
} from './styled';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { data } = useAccountAssets();
  const { data: coinList } = useCoinList();

  const dummyRewardsData = DUMMY_REWARDS;

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const parsedCoinId = parseCoinId(coinId);

  // TODO fee 계산에도 밸런스 걊이 필요하니 AccountAssets를 참조하는게 맞음.
  const mainRewardCoin = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'cosmos') {
      return data.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  const coinSymbol = mainRewardCoin?.asset.symbol || '';

  const chainName = mainRewardCoin?.chain.name || '';

  const accumulatedRewards = (() => {
    const flattenedRewards = dummyRewardsData.flatMap((entry) => entry.reward);

    const denomTotalAmountMap = flattenedRewards.reduce((acc: Record<string, string>, { denom, amount }) => {
      if (!acc[denom]) {
        acc[denom] = '0';
      }
      const aaaa = plus(acc[denom], amount);
      acc[denom] = aaaa;
      return acc;
    }, {});

    const result = Object.entries(denomTotalAmountMap).map(([denom, totalAmount]) => ({
      denom,
      amount: totalAmount,
    }));
    return result;
  })();

  const rewardCoins = accumulatedRewards.map((item) => {
    const rewardCoinAccountAsset = [...(coinList?.cosmosAssets || []), ...(coinList?.cw20Assets || [])].find(
      (asset) => mainRewardCoin?.chain.chainType === asset.chainType && mainRewardCoin?.chain.id === asset.chainId && asset.id === item.denom,
    );

    const displayRewardAmount = toDisplayDenomAmount(item.amount, rewardCoinAccountAsset?.decimals || 0);

    return {
      id: rewardCoinAccountAsset?.id,
      coinImage: rewardCoinAccountAsset?.image,
      symbol: rewardCoinAccountAsset?.symbol,
      coinGeckoId: rewardCoinAccountAsset?.coinGeckoId,
      displayRewardAmount,
    };
  });

  const isMultipleRewardCoins = rewardCoins.length > 1;

  const rewardCoinImages = rewardCoins
    .sort((a) => (a.id === mainRewardCoin?.asset.id ? -1 : 1))
    .map((item) => item.coinImage || '')
    .slice(0, 5)
    .filter((item) => item);

  // NOTE 전체 밸리데이터 리스트를 의미
  const testValidator = [
    {
      validatorName: 'testValidator1',
      validatorAddress: 'testValidatorAddress1',
      votingPower: '23895865',
      commission: '5',
      validatorImage: 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png',
    },
    {
      validatorName: 'testValidator2',
      validatorAddress: 'testValidatorAddress2',
      votingPower: '23895865',
      commission: '5',
      validatorImage: 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png',
    },
    {
      validatorName: 'testValidator3',
      validatorAddress: 'testValidatorAddress3',
      votingPower: '23895865',
      commission: '5',
      validatorImage: 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png',
    },
  ];

  const validatorAddress = testValidator[0].validatorAddress;

  const displayMainCoinRewardAmount = rewardCoins.find((item) => item.id === mainRewardCoin?.asset.id)?.displayRewardAmount || '0';

  const displayTotalRewardValue = rewardCoins.reduce((acc, item) => {
    const coinPrice = (item.coinGeckoId && coinGeckoPrice?.[item.coinGeckoId]?.[currency]) || 0;
    const value = times(coinPrice, item.displayRewardAmount);
    return plus(acc, value);
  }, '0');

  const rewardAddress = mainRewardCoin?.address.address || '';

  const totalValidatorCounts = testValidator.length - 1;
  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImageContainer>
              <CoinImage imageURLs={rewardCoinImages} />
            </CoinImageContainer>
            <CoinSymbolText variant="h2_B">
              {isMultipleRewardCoins
                ? t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimRewards')
                : t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimSymbolRewards', {
                    symbol: coinSymbol,
                  })}
            </CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {isMultipleRewardCoins
                  ? t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.subtitle', {
                      symbol: coinSymbol,
                      coinCount: rewardCoins.length - 1,
                    })
                  : t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.stakingCoin', {
                      chainName: chainName,
                    })}
              </Typography>
            </ChainNameContainer>
          </CoinContainer>

          <InputWrapper>
            <ValidatorSelectBox
              validatorList={testValidator}
              disabled
              currentValidaotorAddress={validatorAddress}
              validatorCounts={totalValidatorCounts}
              label={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.rewardAmount')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={displayMainCoinRewardAmount + ' ' + coinSymbol + `${isMultipleRewardCoins ? ` + ${rewardCoins.length - 1} Coins` : ''}`}
              disabled
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency} isApporximation>
                          {displayTotalRewardValue}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.memo')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={inputMemo}
              onChange={(e) => setInputMemo(e.target.value)}
            />
          </InputWrapper>
        </>
      </BaseBody>
      <BaseFooter>
        <>
          <InformationPanel
            varitant="info"
            title={<Typography variant="b3_M">{t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.inform')}</Typography>}
            body={
              <InformationPanelBody>
                <Typography variant="b4_R_Multiline">
                  {t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription', {
                    address: rewardAddress,
                  })}
                </Typography>
              </InformationPanelBody>
            }
          />

          <EdgeAligner>
            <Divider />
          </EdgeAligner>
          {/* <Fee
            onClickConfirm={() => {
              setIsOpenReviewBottomSheet(true);
            }}
          /> */}
        </>
      </BaseFooter>
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimAllRewardsReview')}
        contentsSubTitle={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimAllRewardsReviewDescription')}
        confirmButtonText={t('pages.wallet.claim-all-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimAllRewards')}
        onClickCancel={() => {
          console.log('onClickCancel');
        }}
        onClickConfirm={() => {
          navigate({
            to: TxResult.to,
            search: {
              address: rewardAddress,
              coinId,
              txHash: 'BE8D07E79F4F74C64C2F672621FF05A6CA13F3541AFAD36F8C7037D28B2C05C4',
            },
          });
        }}
      />
    </>
  );
}
