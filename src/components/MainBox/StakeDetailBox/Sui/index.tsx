import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import { useDelegations } from '@/hooks/sui/useDelegations';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { Route as Unstake } from '@/pages/wallet/unstake/$coinId';
import { plus, toDisplayDenomAmount } from '@/utils/numbers';

import {
  AmountContainer,
  BodyContainer,
  BodyContentsContainer,
  BottomButtonContainer,
  LabelAttributeText,
  LabelLeftContainer,
  SpacedTypography,
  StyledIconTextButton,
  TopContainer,
  ValueAttributeText,
} from './styled';
import MainBox from '../..';

import ClassificationIcon from '@/assets/images/icons/Classification10.svg';
import StakeIcon from '@/assets/images/icons/Stake22.svg';
import UnstakeIcon from '@/assets/images/icons/Unstake22.svg';

import stakemanageBg from '@/assets/images/stakeManageBg.png';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { delegation, suiCosmostationValidator, activeDelegationDetails } = useDelegations({ coinId });

  const { getSuiAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getSuiAccountAsset();

  const symbol = currentCoin?.asset.symbol;
  const decimals = currentCoin?.asset.decimals;

  const displayTotalStakedAmount = toDisplayDenomAmount(delegation?.totalStakedAmount || '0', decimals || 0);
  const displayTotalEarnedAmount = toDisplayDenomAmount(delegation.totalEstimatedRewards || '0', decimals || 0);
  const displayTotalStakedAndEarned = plus(displayTotalStakedAmount, displayTotalEarnedAmount);

  return (
    <>
      <MainBox
        top={
          <TopContainer>
            <Base1300Text variant="h2_B">
              {t('components.MainBox.StakeDetailBox.Sui.index.title', {
                symbol: symbol,
              })}
            </Base1300Text>
          </TopContainer>
        }
        body={
          <BodyContainer>
            <BodyContentsContainer>
              <Base1000Text variant="b2_M">{t('components.MainBox.StakeDetailBox.Sui.index.totalStaked')}</Base1000Text>
              <AmountContainer>
                <BalanceDisplay typoOfIntegers="h3n_B" typoOfDecimals="h5n_M" fixed={6}>
                  {displayTotalStakedAndEarned}
                </BalanceDisplay>
                &nbsp;
                <Base1300Text variant="h5n_M">{symbol}</Base1300Text>
              </AmountContainer>
            </BodyContentsContainer>

            <BodyContentsContainer>
              <LabelLeftContainer>
                <ClassificationIcon />
                <LabelAttributeText variant="b3_M">{t('components.MainBox.StakeDetailBox.Sui.index.staked')}</LabelAttributeText>
              </LabelLeftContainer>

              <ValueAttributeText>
                <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                  {displayTotalStakedAmount}
                </BalanceDisplay>
                <Typography variant="b4_M">{symbol}</Typography>
              </ValueAttributeText>
            </BodyContentsContainer>

            <BodyContentsContainer>
              <LabelLeftContainer>
                <ClassificationIcon />
                <LabelAttributeText variant="b3_M">{t('components.MainBox.StakeDetailBox.Sui.index.earned')}</LabelAttributeText>
              </LabelLeftContainer>

              <ValueAttributeText>
                <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                  {displayTotalEarnedAmount}
                </BalanceDisplay>
                <Typography variant="b4_M">{symbol}</Typography>
              </ValueAttributeText>
            </BodyContentsContainer>
          </BodyContainer>
        }
        bottom={
          <BottomButtonContainer>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: Stake.to,
                  params: { coinId: coinId, validatorAddress: suiCosmostationValidator?.suiAddress || '' },
                });
              }}
              leadingIcon={<StakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Sui.index.stake')}</SpacedTypography>
            </StyledIconTextButton>
            <StyledIconTextButton
              onClick={() => {
                navigate({
                  to: Unstake.to,
                  params: { coinId: coinId },
                });
              }}
              disabled={!activeDelegationDetails || activeDelegationDetails.length === 0}
              leadingIcon={<UnstakeIcon />}
              direction="vertical"
            >
              <SpacedTypography variant="b3_M">{t('components.MainBox.StakeDetailBox.Sui.index.unstake')}</SpacedTypography>
            </StyledIconTextButton>
          </BottomButtonContainer>
        }
        className="circleGradient"
        bgImageClassName="stake"
        coinBackgroundImage={stakemanageBg}
      />
    </>
  );
}
