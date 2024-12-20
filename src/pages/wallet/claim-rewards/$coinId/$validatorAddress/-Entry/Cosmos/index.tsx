import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
import Fee from '@/components/Fee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { useCoinList } from '@/hooks/useCoinList';
import { Route as TxResult } from '@/pages/wallet/tx-result/$txHash/$coinId';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import {
  ChainNameContainer,
  CoinContainer,
  CoinImage,
  CoinSymbolText,
  Divider,
  EstimatedValueTextContainer,
  InformationPanelBody,
  InputWrapper,
} from './styled';

type CosmosProps = {
  coinId: string;
  validatorAddress: string;
};

export default function Cosmos({ coinId, validatorAddress }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currency } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { data } = useAccountAssets();
  const { data: coinList } = useCoinList();

  const parsedCoinId = parseCoinId(coinId);

  const selectedRewardCoin = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'cosmos') {
      return data.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  const coinImageURL = selectedRewardCoin?.asset.image || '';

  const coinSymbol = selectedRewardCoin?.asset.symbol || '';

  const chainName = selectedRewardCoin?.chain.name || '';

  const dummyRewardCoins = [
    {
      denom: 'uatom',
      amount: '26.502816812266307000',
    },
    {
      denom: 'ibc/0025F8A87464A471E66B234C4F93AEC5B4DA3D42D7986451A059273426290DD5',
      amount: '0.003216381433783000',
    },
    {
      denom: 'ibc/054892D6BB43AF8B93AAC28AA5FD7019D2C59A15DAFD6F45C1FA2BF9BDA22454',
      amount: '0.014556803297784000',
    },
    {
      denom: 'ibc/5CAE744C89BC70AE7B38019A1EDF83199B7E10F00F160E7F4F12BCA7A32A7EE5',
      amount: '0.000142359298774000',
    },
    {
      denom: 'ibc/6B8A3F5C2AD51CD6171FA41A7E8C35AD594AB69226438DB94450436EA57B3A89',
      amount: '0.026595157274571000',
    },
    {
      denom: 'ibc/715BD634CF4D914C3EE93B0F8A9D2514B743F6FE36BC80263D1BC5EE4B3C5D40',
      amount: '0.022818319994579000',
    },
  ];

  const rewardCoins = dummyRewardCoins.map((item) => {
    const rewardCoinAccountAsset = [...(coinList?.cosmosAssets || []), ...(coinList?.cw20Assets || [])].find(
      (asset) => selectedRewardCoin?.chain.chainType === asset.chainType && selectedRewardCoin?.chain.id === asset.chainId && asset.id === item.denom,
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

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

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

  const currentValidator = testValidator.find((validator) => validator.validatorAddress === validatorAddress);

  console.log('🚀 ~ Cosmos ~ currentValidator:', currentValidator);

  const displayRewardAmount = rewardCoins.find((item) => item.id === selectedRewardCoin?.asset.id)?.displayRewardAmount || '0';

  const displayTotalRewarValue = rewardCoins.reduce((acc, item) => {
    const coinPrice = (item.coinGeckoId && coinGeckoPrice?.[item.coinGeckoId]?.[currency]) || 0;
    const value = times(coinPrice, item.displayRewardAmount);
    return plus(acc, value);
  }, '0');

  const rewardAddress = selectedRewardCoin?.address.address || '';
  return (
    <>
      <BaseBody>
        <>
          <CoinContainer>
            <CoinImage imageURL={coinImageURL} />
            <CoinSymbolText variant="h2_B">
              {t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimSymbolRewards', {
                symbol: coinSymbol,
              })}
            </CoinSymbolText>
            <ChainNameContainer>
              <Typography variant="b3_M">
                {t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.stakingCoin', {
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
              label={t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.rewardAmount')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={displayRewardAmount + ' ' + coinSymbol + `${rewardCoins.length > 1 ? ` + ${rewardCoins.length - 1} Coins` : ''}`}
              disabled
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency} isApporximation>
                          {displayTotalRewarValue}
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
              label={t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.memo')}
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
            title={<Typography variant="b3_M">{t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.inform')}</Typography>}
            body={
              <InformationPanelBody>
                <Typography variant="b4_R_Multiline">
                  {t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription', {
                    address: rewardAddress,
                  })}
                </Typography>
              </InformationPanelBody>
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
        contentsTitle={t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimRewardsReview')}
        contentsSubTitle={t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimRewardsReviewDescription')}
        confirmButtonText={t('pages.wallet.claim-rewards.$coinId.$validatorAddress.Entry.Cosmos.index.claimRewards')}
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
