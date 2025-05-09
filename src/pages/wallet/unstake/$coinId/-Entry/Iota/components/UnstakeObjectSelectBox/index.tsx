import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import type { IotaDelegationData } from '@/hooks/iota/useDelegations';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { plus, times, toDisplayDenomAmount } from '@/utils/numbers';
import { shorterAddress } from '@/utils/string';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AmountContainer,
  ChevronIconContainer,
  CommissionContainer,
  LabelAttributeText,
  LabelLeftContainer,
  StakingInfoContainer,
  StakingInfoDetailContainer,
  StakingInfoRowContainer,
  StakingInfoTitleRowContainer,
  StakingInfoTitleRowRightContainer,
  StyledButton,
  StyledValidatorImage,
  TopContainer,
  TopLeftContainer,
  TopLeftContentsContainer,
  ValidatorNameContainer,
  ValueAttributeText,
} from './styled';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import ClassificationIcon from '@/assets/images/icons/Classification10.svg';

type UnstakeObjectSelectBoxProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  isOpenBottomSheet?: boolean;
  contentData?: IotaDelegationData;
  disabled?: boolean;
};

export default function UnstakeObjectSelectBox({ isOpenBottomSheet = false, contentData, disabled, ...remainder }: UnstakeObjectSelectBoxProps) {
  const { t } = useTranslation();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data: coinGeckoPrice } = useCoinGeckoPrice();

  const shortedObjectId = shorterAddress(contentData?.objectId, 15);

  const decimals = contentData?.decimals || 9;
  const symbol = contentData?.symbol || 'IOTA';

  const displayStakedAmount = toDisplayDenomAmount(contentData?.stakedAmount || '0', decimals);
  const displayEarnedAmount = toDisplayDenomAmount(contentData?.earnedAmount || '0', decimals);
  const displayTotalStakedAndEarned = plus(displayStakedAmount, displayEarnedAmount);

  const coinPrice = (contentData?.coinGeckoId && coinGeckoPrice?.[contentData.coinGeckoId]?.[userCurrencyPreference]) || 0;
  const totalValue = times(displayTotalStakedAndEarned, coinPrice);

  return (
    <StyledButton type="button" {...remainder} disabled={disabled}>
      <TopContainer>
        {contentData ? (
          <>
            <TopLeftContentsContainer>
              <StyledValidatorImage imageURL={contentData.validatorImage} />
              <TopLeftContainer>
                <ValidatorNameContainer>
                  <Base1300Text variant="b2_M">{contentData.validatorName}</Base1300Text>
                </ValidatorNameContainer>
                <CommissionContainer>
                  <Base1000Text variant="b4_R">
                    {t('pages.wallet.unstake.$coinId.entry.Iota.components.UnstakeObjectSelectBox.index.objectId', {
                      objectId: shortedObjectId,
                    })}
                  </Base1000Text>
                </CommissionContainer>
              </TopLeftContainer>
            </TopLeftContentsContainer>

            {!disabled && (
              <ChevronIconContainer data-is-open={isOpenBottomSheet}>
                <BottomFilledChevronIcon />
              </ChevronIconContainer>
            )}
          </>
        ) : (
          <>
            <Base1000Text variant="b3_M">{t('pages.wallet.unstake.$coinId.entry.Iota.components.UnstakeObjectSelectBox.index.selectValidator')}</Base1000Text>

            {!disabled && (
              <ChevronIconContainer data-is-open={isOpenBottomSheet}>
                <BottomFilledChevronIcon />
              </ChevronIconContainer>
            )}
          </>
        )}
      </TopContainer>
      <StakingInfoContainer>
        <StakingInfoTitleRowContainer>
          <Base1000Text variant="b3_M">{t('pages.wallet.unstake.$coinId.entry.Iota.components.UnstakeObjectSelectBox.index.amountToStake')}</Base1000Text>
          <StakingInfoTitleRowRightContainer>
            <AmountContainer>
              <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                {displayTotalStakedAndEarned}
              </NumberTypo>
              &nbsp;
              <Base1300Text variant="b4_M">{symbol}</Base1300Text>
            </AmountContainer>
            <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference}>
              {totalValue}
            </NumberTypo>
          </StakingInfoTitleRowRightContainer>
        </StakingInfoTitleRowContainer>

        <StakingInfoDetailContainer>
          <StakingInfoRowContainer>
            <LabelLeftContainer>
              <ClassificationIcon />
              <LabelAttributeText variant="b4_R">
                {t('pages.wallet.unstake.$coinId.entry.Iota.components.UnstakeObjectSelectBox.index.staked')}
              </LabelAttributeText>
            </LabelLeftContainer>

            <ValueAttributeText>
              <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                {displayStakedAmount}
              </NumberTypo>
            </ValueAttributeText>
          </StakingInfoRowContainer>

          <StakingInfoRowContainer>
            <LabelLeftContainer>
              <ClassificationIcon />
              <LabelAttributeText variant="b4_R">
                {t('pages.wallet.unstake.$coinId.entry.Iota.components.UnstakeObjectSelectBox.index.earned')}
              </LabelAttributeText>
            </LabelLeftContainer>

            <ValueAttributeText>
              <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={decimals}>
                {displayEarnedAmount}
              </NumberTypo>
            </ValueAttributeText>
          </StakingInfoRowContainer>
        </StakingInfoDetailContainer>
      </StakingInfoContainer>
    </StyledButton>
  );
}
