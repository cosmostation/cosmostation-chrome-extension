import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner/index.tsx';
import Base1000Text from '@/components/common/Base1000Text/index.tsx';
import Base1300Text from '@/components/common/Base1300Text/index.tsx';
import NumberTypo from '@/components/common/NumberTypo/index.tsx';
import InformationPanel from '@/components/InformationPanel/index.tsx';
import ReviewBottomSheet from '@/components/ReviewBottomSheet/index.tsx';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets.ts';
import { getCoinId, parseCoinId } from '@/utils/queryParamGenerator.ts';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore.ts';

import CoinInputBox from './-components/CoinInputBox/index.tsx';
import CoinOutputBox from './-components/CoinOutputBox/index.tsx';
import {
  CoinBoxContainer,
  CoinBoxDivider,
  Divider,
  FlipCoinButton,
  InformAmountSpan,
  InformContainer,
  SlippageTextButton,
  SwapInfoContainer,
  SwapInfoRowContainer,
} from './-styled.tsx';

import FlipIcon from '@/assets/images/icons/Flip18.svg';

type EntryProps = {
  coinId: string;
};

export default function Entry({ coinId }: EntryProps) {
  const { t } = useTranslation();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const { data } = useAccountAllAssets();

  const [isOpenReviewBottomSheet, setIsOpenReviewBottomSheet] = useState(false);

  const [currentFromCoinId, setCurrentFromCoinId] = useState(coinId);
  const parsedFromCoinId = parseCoinId(currentFromCoinId);

  const currentFromCoin = (() => {
    if (!data) return undefined;

    if (parsedFromCoinId.chainType === 'cosmos') {
      const aggregatedCosmosAccountAssets = [...data.cosmosAccountAssets, ...data.cw20AccountAssets];

      return aggregatedCosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    if (parsedFromCoinId.chainType === 'evm') {
      const aggregatedEVMAccountAssets = [...data.evmAccountAssets, ...data.erc20AccountAssets];

      return aggregatedEVMAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    if (parsedFromCoinId.chainType === 'sui') {
      return data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }
    if (parsedFromCoinId.chainType === 'aptos') {
      return data?.aptosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  const { currentFromCoinSymbol } = (() => {
    const coinSymbol = currentFromCoin?.asset.symbol || '';

    return {
      currentFromCoinSymbol: coinSymbol,
    };
  })();

  const [currentToCoinId, setCurrentToCoinId] = useState(coinId);
  const parsedToCoinId = parseCoinId(currentToCoinId);

  const currentToCoin = (() => {
    if (!data) return undefined;

    if (parsedToCoinId.chainType === 'cosmos') {
      const aggregatedCosmosAccountAssets = [...data.cosmosAccountAssets, ...data.cw20AccountAssets];

      return aggregatedCosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    if (parsedToCoinId.chainType === 'evm') {
      const aggregatedEVMAccountAssets = [...data.evmAccountAssets, ...data.erc20AccountAssets];

      return aggregatedEVMAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    if (parsedToCoinId.chainType === 'sui') {
      return data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }
    if (parsedToCoinId.chainType === 'aptos') {
      return data?.aptosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
    }

    return undefined;
  })();

  const [inputDisplayAmount, setInputDisplayAmount] = useState<string>('');

  const estimatedMinReceivedAmount = '0.01';

  const informTitleErrorMessage = useMemo(() => {
    return t('pages.wallet.swap.$coinId.entry.invalidFee');
  }, [t]);

  const informSubTitleErrorMessage = useMemo(() => {
    return (
      <>
        {t('pages.wallet.swap.$coinId.entry.invalidFeeDescription1')}
        <InformAmountSpan>{'0.0097123 ETH'}</InformAmountSpan>
        {t('pages.wallet.swap.$coinId.entry.invalidFeeDescription2')}
      </>
    );
  }, [t]);

  return (
    <>
      <BaseBody>
        <CoinBoxContainer>
          <CoinInputBox
            coinId={currentFromCoin?.asset ? getCoinId(currentFromCoin?.asset) : ''}
            displayInputAmount={inputDisplayAmount}
            onChangeInputAmount={(inputAmount) => {
              setInputDisplayAmount(inputAmount);
            }}
            onChangeCoin={(coinId) => {
              setCurrentFromCoinId(coinId);
            }}
          />
          <EdgeAligner>
            <CoinBoxDivider />
          </EdgeAligner>
          <CoinOutputBox
            coinId={currentToCoin?.asset ? getCoinId(currentToCoin?.asset) : ''}
            displayMinReceiveAmount={estimatedMinReceivedAmount}
            onChangeCoin={(coinId) => {
              setCurrentToCoinId(coinId);
            }}
          />
          <FlipCoinButton>
            <FlipIcon />
          </FlipCoinButton>
        </CoinBoxContainer>
        <InformContainer>
          <InformationPanel
            varitant="error"
            title={<Typography variant="b3_M">{informTitleErrorMessage}</Typography>}
            body={<Typography variant="b4_R_Multiline">{informSubTitleErrorMessage}</Typography>}
          />
        </InformContainer>
      </BaseBody>
      <BaseFooter>
        <>
          <SwapInfoContainer>
            <SwapInfoRowContainer>
              <Base1000Text variant="b3_R">{t('pages.wallet.swap.$coinId.entry.slippage')}</Base1000Text>
              <SlippageTextButton variant="underline" typoVarient="h6n_M">
                {'1 %'}
              </SlippageTextButton>
            </SwapInfoRowContainer>
            <SwapInfoRowContainer>
              <Base1000Text variant="b3_R">{t('pages.wallet.swap.$coinId.entry.exchageRate')}</Base1000Text>
              <Base1300Text variant="b4_M">
                <Base1300Text variant="h5n_M">{'1 '}</Base1300Text>
                {`${currentFromCoinSymbol} ≈ `}
                <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
                  {'0.01'}
                </NumberTypo>
                &nbsp;
                {'ETH'}
              </Base1300Text>
            </SwapInfoRowContainer>
            <SwapInfoRowContainer>
              <Base1000Text variant="b3_R">{t('pages.wallet.swap.$coinId.entry.provider')}</Base1000Text>
              <Base1300Text variant="b3_R">{'Squidrouter'}</Base1300Text>
            </SwapInfoRowContainer>
            <SwapInfoRowContainer>
              <Base1000Text variant="b3_R">{t('pages.wallet.swap.$coinId.entry.swapVenue')}</Base1000Text>
              <Base1300Text variant="b3_R">{'-'}</Base1300Text>
            </SwapInfoRowContainer>
          </SwapInfoContainer>
          <EdgeAligner>
            <Divider />
          </EdgeAligner>
        </>
      </BaseFooter>
      <ReviewBottomSheet
        open={isOpenReviewBottomSheet}
        onClose={() => setIsOpenReviewBottomSheet(false)}
        contentsTitle={t('pages.wallet.swap.$coinId.entry.sendReview')}
        contentsSubTitle={t('pages.wallet.swap.$coinId.entry.sendReviewSub')}
        confirmButtonText={t('pages.wallet.swap.$coinId.entry.swap')}
        onClickCancel={() => {
          console.log('onClickCancel');
        }}
        onClickConfirm={() => {
          console.log('onClickConfirm');
        }}
      />
    </>
  );
}
