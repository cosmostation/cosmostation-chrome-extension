import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useCoinList } from '@/hooks/useCoinList';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { isMatchingCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AdditionalEstimatedFeeTextContainer,
  AdditionalFeeAmount,
  Base900FeeCustomButton,
  Base900Text,
  ChainContainer,
  ChainImageContainer,
  Container,
  EstimatedFeeTextContainer,
  FeeCustomButton,
  FeeRowWrapper,
  IconContainer,
  LabelLeftContainer,
  RowContainer,
  RowLeftContainer,
  RowRightContainer,
  TotalValue,
} from './styled';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';

type BaseTxInfoProps = {
  feeBaseAmount: string;
  feeCoinId: string;
  additionalFees?: {
    feeCoinId: string;
    feeAmount: string;
    label?: string;
  }[];
  disableFee?: boolean;
  onClickFee?: () => void;
};

export default function BaseTxInfo({ feeBaseAmount, feeCoinId, additionalFees, disableFee = false, onClickFee }: BaseTxInfoProps) {
  const { t } = useTranslation();

  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const { data: coinList } = useCoinList();

  const { getAccountAsset } = useGetAccountAsset({ coinId: feeCoinId });

  const feeCoin = getAccountAsset();

  const coinPrice = (feeCoin?.asset.coinGeckoId && coinGeckoPrice?.[feeCoin.asset.coinGeckoId]?.[userCurrencyPreference]) || 0;

  const displayFeeAmount = useMemo(
    () => (feeBaseAmount ? toDisplayDenomAmount(feeBaseAmount, feeCoin?.asset.decimals || 0) : '0'),
    [feeBaseAmount, feeCoin?.asset.decimals],
  );

  const value = times(displayFeeAmount, coinPrice);

  const formattedAdditionalFees = (() => {
    return additionalFees?.map((item) => {
      const target = coinList?.flatCoinList.find((coin) => isMatchingCoinId(coin, item.feeCoinId));

      if (target) {
        const displayFeeAmount = toDisplayDenomAmount(item.feeAmount, target.decimals);
        const coinPrice = (target.coinGeckoId && coinGeckoPrice?.[target.coinGeckoId]?.[userCurrencyPreference]) || 0;

        const value = times(displayFeeAmount, coinPrice);
        return {
          symbol: target.symbol,
          decimals: target.decimals,
          feeAmount: item.feeAmount,
          displayFeeAmount,
          value,
          label: item.label || t('pages.popup.components.BaseTxInfo.index.additionalFee'),
        };
      }

      return {
        feeAmount: undefined,
        label: item.label || t('pages.popup.components.BaseTxInfo.index.additionalFee'),
      };
    });
  })();

  const totalValue = plus(value, formattedAdditionalFees?.reduce((acc, item) => plus(acc, item.value || '0'), '0') || '0');

  return (
    <Container>
      <RowContainer>
        <RowLeftContainer>
          <Base1000Text variant="b3_R">{t('pages.popup.components.BaseTxInfo.index.network')}</Base1000Text>
        </RowLeftContainer>
        <RowRightContainer>
          <ChainContainer>
            {feeCoin && <ChainImageContainer src={feeCoin?.chain.image} />}
            {feeCoin && <Base1300Text variant="b3_M">{feeCoin?.chain.name || 'UNKNOWN'}</Base1300Text>}
          </ChainContainer>
        </RowRightContainer>
      </RowContainer>

      {formattedAdditionalFees && formattedAdditionalFees?.length > 0 ? (
        <FeeRowWrapper>
          <RowContainer
            style={{
              marginBottom: '0.2rem',
            }}
          >
            <Base1000Text variant="b3_M">{t('pages.popup.components.BaseTxInfo.index.totalFee')}</Base1000Text>

            <TotalValue>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} isDisableHidden isApporximation>
                {totalValue}
              </BalanceDisplay>
            </TotalValue>
          </RowContainer>

          <RowContainer>
            <LabelLeftContainer>
              <IconContainer>
                <ClassificationIcon />
              </IconContainer>
              <Typography variant="b4_R">{t('pages.popup.components.BaseTxInfo.index.networkFee')}</Typography>
            </LabelLeftContainer>
            <RowRightContainer>
              <Base900FeeCustomButton disabled={disableFee} onClick={onClickFee}>
                {feeCoin &&
                  (displayFeeAmount ? (
                    <AdditionalEstimatedFeeTextContainer data-is-disabled={disableFee}>
                      <BalanceDisplay
                        typoOfIntegers="h6n_M"
                        typoOfDecimals="h8n_R"
                        currency={userCurrencyPreference}
                        fixed={6}
                        isDisableLeadingCurreny
                        isDisableHidden
                      >
                        {displayFeeAmount}
                      </BalanceDisplay>
                      &nbsp;
                      <Base900Text variant="b5_M">{feeCoin?.asset.symbol}</Base900Text>
                      &nbsp;
                      <Base900Text variant="b5_M">{'('}</Base900Text>
                      <BalanceDisplay typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isDisableHidden>
                        {value}
                      </BalanceDisplay>
                      <Base900Text variant="b5_M">{')'}</Base900Text>
                    </AdditionalEstimatedFeeTextContainer>
                  ) : (
                    <Base900Text variant="b5_M">{'-'}</Base900Text>
                  ))}
              </Base900FeeCustomButton>
            </RowRightContainer>
          </RowContainer>

          {formattedAdditionalFees.map((item) => {
            return (
              <RowContainer key={item.label}>
                <LabelLeftContainer>
                  <IconContainer>
                    <ClassificationIcon />
                  </IconContainer>
                  <Typography variant="b4_R">{item.label}</Typography>
                </LabelLeftContainer>

                <RowRightContainer>
                  <AdditionalFeeAmount>
                    {item.value ? (
                      <EstimatedFeeTextContainer data-is-disabled={true}>
                        <BalanceDisplay
                          typoOfIntegers="h6n_M"
                          typoOfDecimals="h8n_R"
                          currency={userCurrencyPreference}
                          fixed={6}
                          isDisableLeadingCurreny
                          isDisableHidden
                        >
                          {item.displayFeeAmount}
                        </BalanceDisplay>
                        &nbsp;
                        <Base900Text variant="b5_M">{item.symbol}</Base900Text>
                        &nbsp;
                        <Base900Text variant="b5_M">{'('}</Base900Text>
                        <BalanceDisplay typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isDisableHidden>
                          {item.value}
                        </BalanceDisplay>
                        <Base900Text variant="b5_M">{')'}</Base900Text>
                      </EstimatedFeeTextContainer>
                    ) : (
                      <Base900Text variant="b5_M">{t('pages.popup.components.BaseTxInfo.index.uncertainFee')}</Base900Text>
                    )}
                  </AdditionalFeeAmount>
                </RowRightContainer>
              </RowContainer>
            );
          })}
        </FeeRowWrapper>
      ) : (
        <RowContainer>
          <RowLeftContainer>
            <Base1000Text variant="b3_R">{t('pages.popup.components.BaseTxInfo.index.networkFee')}</Base1000Text>
          </RowLeftContainer>
          <RowRightContainer>
            <FeeCustomButton disabled={disableFee} onClick={onClickFee}>
              {feeCoin &&
                (displayFeeAmount ? (
                  <EstimatedFeeTextContainer data-is-disabled={disableFee}>
                    <BalanceDisplay
                      typoOfIntegers="h5n_M"
                      typoOfDecimals="h7n_R"
                      currency={userCurrencyPreference}
                      fixed={6}
                      isDisableLeadingCurreny
                      isDisableHidden
                    >
                      {displayFeeAmount}
                    </BalanceDisplay>
                    &nbsp;
                    <Base1300Text variant="h7n_M">{feeCoin?.asset.symbol}</Base1300Text>
                    &nbsp;
                    <Base1300Text variant="b2_M">{'('}</Base1300Text>
                    <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} isDisableHidden>
                      {value}
                    </BalanceDisplay>
                    <Base1300Text variant="b2_M">{')'}</Base1300Text>
                  </EstimatedFeeTextContainer>
                ) : (
                  <Base1300Text variant="b2_M">{'-'}</Base1300Text>
                ))}
            </FeeCustomButton>
          </RowRightContainer>
        </RowContainer>
      )}
    </Container>
  );
}
