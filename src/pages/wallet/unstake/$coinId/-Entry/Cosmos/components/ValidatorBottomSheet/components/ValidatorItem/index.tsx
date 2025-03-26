import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Image from '@/components/common/Image';
import NumberTypo from '@/components/common/NumberTypo';
import type { UnstakeItemButtonProps } from '@/pages/wallet/unstake/$coinId/-components/UnstakeItemButton';
import UnstakeItemButton from '@/pages/wallet/unstake/$coinId/-components/UnstakeItemButton';
import { gt, toDisplayDenomAmount } from '@/utils/numbers';

import {
  AmountContainer,
  ImageContainer,
  LabelAttributeText,
  LabelLeftContainer,
  StakingInfoContainer,
  StakingInfoDetailContainer,
  StakingInfoRowContainer,
  TopLeftContainer,
  TopLeftContentsContainer,
  ValidatorNameContainer,
} from './styled';

import defaultValidatorImage from '@/assets/images/chain/defaultChain.png';

type ValidatorButtonProps = UnstakeItemButtonProps & {
  validatorName: string;
  validatorAddress: string;
  commission: string;
  stakedAmount: string;
  rewardAmount: string;
  symbol: string;
  decimals: number;
  validatorImage?: string;
  rewardTokenCounts?: string;
};

const ValidatorButton = forwardRef<HTMLButtonElement, ValidatorButtonProps>(
  ({ validatorName, validatorImage, commission, stakedAmount, symbol, rewardTokenCounts, rewardAmount, decimals, onClick, ...remainder }, ref) => {
    const { t } = useTranslation();

    const displayStakedAmount = toDisplayDenomAmount(stakedAmount, decimals);
    const displayEarnedAmount = toDisplayDenomAmount(rewardAmount, decimals);

    return (
      <UnstakeItemButton
        ref={ref}
        isActive={remainder.isActive}
        onClick={onClick}
        headerContent={
          <TopLeftContentsContainer>
            <ImageContainer>
              <Image src={validatorImage} defaultImgSrc={defaultValidatorImage} />
            </ImageContainer>
            <TopLeftContainer>
              <ValidatorNameContainer>
                <Base1300Text variant="b2_M">{validatorName}</Base1300Text>
              </ValidatorNameContainer>
              <Base1000Text variant="b4_R">
                {t('pages.wallet.unstake.$coinId.entry.Cosmos.components.ValidatorBottomSheet.components.ValidatorItem.index.commission', {
                  commission: commission,
                })}
              </Base1000Text>
            </TopLeftContainer>
          </TopLeftContentsContainer>
        }
        bodyContent={
          <StakingInfoContainer>
            <StakingInfoDetailContainer>
              <StakingInfoRowContainer>
                <LabelLeftContainer>
                  <LabelAttributeText variant="b3_R">
                    {t('pages.wallet.unstake.$coinId.entry.Cosmos.components.ValidatorBottomSheet.components.ValidatorItem.index.staked')}
                  </LabelAttributeText>
                </LabelLeftContainer>

                <AmountContainer>
                  <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                    {displayStakedAmount}
                  </NumberTypo>
                  &nbsp;
                  <Base1300Text variant="b4_M">{symbol}</Base1300Text>
                </AmountContainer>
              </StakingInfoRowContainer>

              <StakingInfoRowContainer>
                <LabelLeftContainer>
                  <LabelAttributeText variant="b3_R">
                    {t('pages.wallet.unstake.$coinId.entry.Cosmos.components.ValidatorBottomSheet.components.ValidatorItem.index.reward')}
                  </LabelAttributeText>
                  &nbsp;
                  {gt(rewardTokenCounts || '0', 0) && <LabelAttributeText variant="b4_R">{`+ ${rewardTokenCounts}`}</LabelAttributeText>}
                </LabelLeftContainer>

                <AmountContainer>
                  <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={decimals}>
                    {displayEarnedAmount}
                  </NumberTypo>
                  &nbsp;
                  <Base1300Text variant="b4_M">{symbol}</Base1300Text>
                </AmountContainer>
              </StakingInfoRowContainer>
            </StakingInfoDetailContainer>
          </StakingInfoContainer>
        }
      />
    );
  },
);

ValidatorButton.displayName = 'ValidatorButton';

export default ValidatorButton;
