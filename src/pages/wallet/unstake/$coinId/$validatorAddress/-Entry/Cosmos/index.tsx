import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import Base1000Text from '@/components/common/Base1000Text';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import BalanceButton from '@/components/common/StandardInput/components/BalanceButton/index.tsx';
import StandardInput from '@/components/common/StandardInput/index.tsx';
// import Fee from '@/components/Fee';
import InformationPanel from '@/components/InformationPanel';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import ValidatorSelectBox from '@/components/ValidatorSelectBox';
import { useAccountAssets } from '@/hooks/useAccountAssets.ts';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice.ts';
import { Route as TxResult } from '@/pages/wallet/tx-result/$txHash/$coinId';
import { times, toDisplayDenomAmount } from '@/utils/numbers.ts';
import { getCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { isDecimal } from '@/utils/string.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import ValidatorBottomSheet from './components/ValidatorBottomSheet';
import { ChainNameContainer, CoinContainer, CoinImage, CoinSymbolText, Divider, EstimatedValueTextContainer, InputWrapper, LockDateTextSpan } from './styled';

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

  const parsedCoinId = parseCoinId(coinId);

  const selectedUnstakingCoin = (() => {
    if (!data) return undefined;

    if (parsedCoinId.chainType === 'cosmos') {
      return data.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  const coinImageURL = selectedUnstakingCoin?.asset.image || '';

  const coinSymbol = selectedUnstakingCoin?.asset.symbol || '';
  const coinDecimal = selectedUnstakingCoin?.asset.decimals || 0;

  const chainName = selectedUnstakingCoin?.chain.name || '';

  const coinGeckoId = selectedUnstakingCoin?.asset.coinGeckoId || '';
  const coinPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[currency]) || 0;

  const baseAvailableAmount = selectedUnstakingCoin?.balance || '0';
  const displayAvailableAmount = toDisplayDenomAmount(baseAvailableAmount, coinDecimal);

  console.log('🚀 ~ Entry ~ displayAvailableAmount:', displayAvailableAmount);

  // FIXME: 밸런스 그대로를 입력할 지 예상 가스비를 제외한 값을 맥스값으로 설정할 지 결정 필요.
  const maxAmount = '1000000000000';

  const [sendDisplayAmount, setSendDisplayAmount] = useState('');

  const displaySendAmountPrice = sendDisplayAmount ? times(sendDisplayAmount, coinPrice) : '0';

  const [inputMemo, setInputMemo] = useState('');

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);
  const [isOpenValidatorBottomSheet, setIsOpenValidatorBottomSheet] = useState(false);

  const [currentValidaotrAddress, setCurrentValidaotrAddress] = useState(validatorAddress);

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

  const currentValidator = testValidator.find((validator) => validator.validatorAddress === currentValidaotrAddress);

  const lockUpPeriod = '21';
  console.log('🚀 ~ Entry ~ currentValidator:', currentValidator);

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

          <InputWrapper>
            <ValidatorSelectBox
              validatorList={testValidator}
              currentValidaotorAddress={currentValidaotrAddress}
              onClickItem={() => {
                setIsOpenValidatorBottomSheet(true);
              }}
              isBottomSheetOpen={isOpenValidatorBottomSheet}
              label={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.validator')}
            />

            <StandardInput
              label={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.unstakingAmount')}
              // error={!!errors.password}
              // helperText={errors.password?.message}
              value={sendDisplayAmount}
              onChange={(e) => {
                if (!isDecimal(e.currentTarget.value, coinDecimal || 0) && e.currentTarget.value) {
                  return;
                }

                setSendDisplayAmount(e.currentTarget.value);
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <EstimatedValueTextContainer>
                        <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={currency} isApporximation>
                          {displaySendAmountPrice}
                        </NumberTypo>
                      </EstimatedValueTextContainer>
                    </InputAdornment>
                  ),
                },
              }}
              rightBottomAdornment={
                selectedUnstakingCoin && (
                  <BalanceButton
                    onClick={() => {
                      setSendDisplayAmount(maxAmount);
                    }}
                    leftComponent={
                      <Base1000Text variant="b3_R">{`${t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.staked')} :`}</Base1000Text>
                    }
                    coin={selectedUnstakingCoin?.asset}
                    balance={baseAvailableAmount}
                  />
                )
              }
            />
            <StandardInput
              multiline
              maxRows={3}
              label={t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.memo')}
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
            title={<Typography variant="b3_M">{t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.inform')}</Typography>}
            body={
              <Typography variant="b4_R_Multiline">
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription1', {
                  symbol: coinSymbol,
                })}
                <LockDateTextSpan>
                  {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.lockUpPeriod', {
                    lockUpPeriod: lockUpPeriod,
                  })}
                </LockDateTextSpan>
                {t('pages.wallet.unstake.$coinId.$validatorAddress.Entry.Cosmos.index.informDescription2')}
              </Typography>
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
      <ValidatorBottomSheet
        validatorList={testValidator}
        open={isOpenValidatorBottomSheet}
        onClose={() => setIsOpenValidatorBottomSheet(false)}
        currentValidatorId={currentValidaotrAddress}
        currentUnstakingCoinId={coinId}
        onClickItem={(validatorAddress) => {
          setCurrentValidaotrAddress(validatorAddress);
        }}
      />
    </>
  );
}
