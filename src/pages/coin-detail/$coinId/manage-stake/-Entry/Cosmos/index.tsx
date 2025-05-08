import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';
import { Tab, Tabs } from '@/components/common/Tab';
import EmptyAsset from '@/components/EmptyAsset';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID } from '@/constants/cosmos/chain';
import { useDelegationInfo } from '@/hooks/cosmos/useDelegationInfo';
import { useUndelegation } from '@/hooks/cosmos/useUndelegation';
import { useValidators } from '@/hooks/cosmos/useValidators';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { gt, times, toDisplayDenomAmount } from '@/utils/numbers';
import { parseCoinId } from '@/utils/queryParamGenerator';
import { shorterAddress } from '@/utils/string';

import StakingItem from './components/StakingItem';
import UnstakingItem from './components/UnstakingItem';
import {
  ChipButtonContentsContainer,
  Container,
  Divider,
  EmptyAssetContainer,
  IconContainer,
  StakingItemContainer,
  StickyTabContainer,
  StyledTabPanel,
  TabWrapper,
} from './styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';
import StakeMachineIcon from '@/assets/images/icons/StakeMaching70.svg';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['My Staking', 'My Unstaking'];

  const { getCosmosAccountAsset } = useGetAccountAsset({ coinId });

  const currentCoin = getCosmosAccountAsset();

  const validators = useValidators({ coinId });
  const delegationInfo = useDelegationInfo({ coinId });
  const undelegation = useUndelegation({ coinId });

  const isNTRN = [NEUTRON_CHAINLIST_ID, NEUTRON_TESTNET_CHAINLIST_ID].some((item) => item === parseCoinId(coinId).chainId);

  const stakingItems = useMemo(
    () =>
      delegationInfo.delegationInfo
        .map((item) => {
          const denom = parseCoinId(coinId).id;

          const displayStakedAmount = toDisplayDenomAmount(item.totalDelegationAmount, currentCoin?.asset.decimals || 0);

          const rewardAmount = item.rewardInfo?.reward.find((reward) => reward.denom === denom)?.amount || '0';
          const displayRewardAmount = toDisplayDenomAmount(rewardAmount, currentCoin?.asset.decimals || 0);

          const restRewards = item.rewardInfo?.reward.filter((reward) => reward.denom !== denom).length || 0;
          const restRewardCounts = gt(restRewards, '0') ? restRewards.toString() : undefined;

          const commissionPercentage = item.validatorInfo?.commission.commission_rates.rate
            ? times(item.validatorInfo?.commission.commission_rates.rate, '100', 0)
            : undefined;

          return {
            stakingCoinId: coinId,
            validatorAddress: item.validatorAddress,
            validatorImage: item.validatorInfo?.monikerImage,
            validatorName: item.validatorInfo?.description.moniker || shorterAddress(item.validatorAddress, 12) || '',
            status: item.validatorInfo?.validatorStatus,
            commission: commissionPercentage,
            symbol: currentCoin?.asset.symbol || '',
            stakedAmount: displayStakedAmount,
            decimals: currentCoin?.asset.decimals || 0,
            rewardAmount: displayRewardAmount,
            rewardCounts: restRewardCounts,
          };
        })
        .sort((a, b) => (gt(a.stakedAmount, b.stakedAmount) ? -1 : 1)),
    [coinId, currentCoin?.asset.decimals, currentCoin?.asset.symbol, delegationInfo.delegationInfo],
  );

  const cosmostationValidator = useMemo(
    () => validators.data.find((validator) => validator.description.moniker.toLowerCase().includes('cosmostation')),
    [validators.data],
  );

  const unstakingItems = useMemo(() => {
    return undelegation.data?.map((item) => {
      const displayUnstakingAmount = toDisplayDenomAmount(item.entries.balance, currentCoin?.asset.decimals || 0);

      return {
        validatorAddress: item.validator_address,
        creationHeight: item.entries.creation_height,
        amount: item.entries.balance,
        validatorImage: item.validatorInfo?.monikerImage,
        validatorName: item.validatorInfo?.description.moniker || shorterAddress(item.validator_address, 12) || '',
        symbol: currentCoin?.asset.symbol || '',
        decimals: currentCoin?.asset.decimals || 0,
        unstakingAmount: displayUnstakingAmount,
        unstakingCompletionTime: item.entries.completion_time,
        status: item.validatorInfo?.validatorStatus,
      };
    });
  }, [currentCoin?.asset.decimals, currentCoin?.asset.symbol, undelegation.data]);

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StakeDetailBox coinId={coinId} />
          <Divider />
          <TabWrapper>
            <StickyTabContainer>
              <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
                {tabLabels.map((item) => (
                  <Tab key={item} label={item} />
                ))}
              </Tabs>
            </StickyTabContainer>
            <StyledTabPanel value={tabValue} index={0}>
              <StakingItemContainer>
                {stakingItems.length > 0 ? (
                  stakingItems.map((item, index) => <StakingItem key={index} {...item} isHideReward={isNTRN} />)
                ) : (
                  <EmptyAssetContainer>
                    <EmptyAsset
                      icon={<StakeMachineIcon />}
                      title={t('pages.coin-detail.$coinId.manage-stake.entry.Cosmos.index.startStaking')}
                      subTitle={t('pages.coin-detail.$coinId.manage-stake.entry.Cosmos.index.startStakingDescription')}
                      chipButtonProps={{
                        onClick: () => {
                          navigate({
                            to: Stake.to,
                            params: {
                              coinId: coinId,
                              validatorAddress: cosmostationValidator?.operator_address || '',
                            },
                          });
                        },
                        children: (
                          <ChipButtonContentsContainer>
                            <Base1300Text variant="b3_M">{t('pages.coin-detail.$coinId.manage-stake.entry.Cosmos.index.goToStake')}</Base1300Text>
                            <IconContainer>
                              <RightArrowIcon />
                            </IconContainer>
                          </ChipButtonContentsContainer>
                        ),
                      }}
                    />
                  </EmptyAssetContainer>
                )}
              </StakingItemContainer>
            </StyledTabPanel>
            <StyledTabPanel value={tabValue} index={1}>
              <StakingItemContainer>
                {unstakingItems.length > 0 ? (
                  unstakingItems.map((item) => (
                    <UnstakingItem
                      stakingCoinId={coinId}
                      key={item.unstakingCompletionTime}
                      validatorAddress={item.validatorAddress}
                      creationHeight={item.creationHeight}
                      baseUnstakingAmount={item.amount}
                      validatorImage={item.validatorImage}
                      validatorName={item.validatorName}
                      symbol={currentCoin?.asset.symbol || ''}
                      decimals={currentCoin?.asset.decimals || 0}
                      unstakingAmount={item.unstakingAmount}
                      unstakingCompletionTime={item.unstakingCompletionTime}
                      status={item.status}
                    />
                  ))
                ) : (
                  <EmptyAssetContainer>
                    <EmptyAsset
                      icon={<NoListIcon />}
                      title={t('pages.coin-detail.$coinId.manage-stake.entry.Cosmos.index.emptyStaking')}
                      subTitle={t('pages.coin-detail.$coinId.manage-stake.entry.Cosmos.index.emptyStakingDescription')}
                    />
                  </EmptyAssetContainer>
                )}
              </StakingItemContainer>
            </StyledTabPanel>
          </TabWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
