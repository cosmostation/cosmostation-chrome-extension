import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BalanceDisplay from '@/components/BalanceDisplay';
import { KAVA_CHAINLIST_ID, NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { useAmount } from '@/hooks/cosmos/useAmount';
import { useCommission } from '@/hooks/cosmos/useCommission';
import { useNTRNReward } from '@/hooks/cosmos/useNTRNReward';
import { useReward } from '@/hooks/cosmos/useReward';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as ClaimCommission } from '@/pages/wallet/claim-commission/$coinId';
import { convertToValidatorAddress } from '@/utils/cosmos/address';
import { gt, toDisplayDenomAmount } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { isEqualsIgnoringCase } from '@/utils/string';

import { AmountDetailWrapper, Container, DetailRow, IconContainer, LabelText, StyledTextButton, StyledTextButtonWrapper, TitleText, ValueText } from './styled';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const isNTRN = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].some((item) => item === parseCoinId(coinId).chainId);

  const { data: ntrnRewards } = useNTRNReward({ coinId: isNTRN ? coinId : undefined });

  const { delegationAmount, unbondingAmount, rewardAmount, incentiveAmount } = useAmount(coinId);

  const reward = useReward({
    coinId,
  });

  const selectedCoin = getCosmosAccountAsset();

  const validatorAddress = convertToValidatorAddress(selectedCoin?.address.address, selectedCoin?.chain.validatorAccountPrefix);
  const commission = useCommission({ coinId, validatorAddress });
  const isValidatorAccount = gt(commission.data?.commission?.commission?.length || 0, '0');

  const decimal = selectedCoin?.asset.decimals || 0;

  const availableDisplayAmount = toDisplayDenomAmount(selectedCoin?.balance || '0', decimal);
  const stakedDisplayAmount = toDisplayDenomAmount(delegationAmount, decimal);
  const unstakingDisplayAmount = toDisplayDenomAmount(unbondingAmount, decimal);
  const rewardsDisplayAmount = toDisplayDenomAmount(isNTRN ? ntrnRewards?.data.pending_rewards.amount || '0' : rewardAmount, decimal);
  const rewardsCoinCounts = isNTRN ? 0 : reward?.data?.total?.length && reward.data.total.length > 1 ? reward.data.total.length - 1 : 0;
  const incentiveDisplayAmount = toDisplayDenomAmount(incentiveAmount, decimal);
  const commissionDisplayAmount = toDisplayDenomAmount(
    commission.data?.commission.commission.find((item) => isEqualsIgnoringCase(item.denom, selectedCoin?.chain.mainAssetDenom))?.amount || '0',
    decimal,
  );

  return (
    <Container>
      <TitleText variant="h3_B">{t('pages.coin-detail.components.AmountDetail.Cosmos.title')}</TitleText>
      <AmountDetailWrapper>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.available')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {availableDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.staked')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {stakedDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.unstaking')}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {unstakingDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        <DetailRow>
          <LabelText variant="b3_R">{`${t('pages.coin-detail.components.AmountDetail.Cosmos.rewards')} ${rewardsCoinCounts ? `+ ${rewardsCoinCounts}` : ''}`}</LabelText>
          <ValueText>
            <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
              {rewardsDisplayAmount}
            </BalanceDisplay>
          </ValueText>
        </DetailRow>
        {isValidatorAccount && (
          <DetailRow>
            <StyledTextButtonWrapper>
              <StyledTextButton
                onClick={() => {
                  navigate({
                    to: ClaimCommission.to,
                    params: {
                      coinId: coinId,
                    },
                  });
                }}
                variant="underline"
                typoVarient="b3_R"
              >
                {t('pages.coin-detail.components.AmountDetail.Cosmos.commission')}
              </StyledTextButton>
              <IconContainer>
                <RightChevronIcon />
              </IconContainer>
            </StyledTextButtonWrapper>

            <ValueText>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                {commissionDisplayAmount}
              </BalanceDisplay>
            </ValueText>
          </DetailRow>
        )}
        {selectedCoin?.chain.id === KAVA_CHAINLIST_ID && (
          <DetailRow>
            <LabelText variant="b3_R">{t('pages.coin-detail.components.AmountDetail.Cosmos.incentive')}</LabelText>
            <ValueText>
              <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" fixed={6}>
                {incentiveDisplayAmount}
              </BalanceDisplay>
            </ValueText>
          </DetailRow>
        )}
      </AmountDetailWrapper>
    </Container>
  );
}
