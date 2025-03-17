import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';
import { Tab, Tabs } from '@/components/common/Tab';
import EmptyAsset from '@/components/EmptyAsset';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { useDelegations } from '@/hooks/sui/useDelegations';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';

import EpochIndicator from './components/EpochIndicator';
import PendingItem from './components/PendingItem';
import StakingItem from './components/StakingItem';
import {
  Container,
  Divider,
  EmptyAssetContainer,
  RightArrowIconContainer,
  StakingItemContainer,
  StickyTabContainer,
  StyledOutlinedChipButton,
  StyledTabPanel,
  TabWrapper,
} from './styled';

import NoListIcon from '@/assets/images/icons/NoList70.svg';
import RightArrow from '@/assets/images/icons/RightArrow14.svg';
import StakeMachineIcon from '@/assets/images/icons/StakeMaching70.svg';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['My Active', 'My Pending'];

  const { activeDelegationDetails, pendingDelegationDetails, suiCosmostationValidator } = useDelegations({ coinId });

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StakeDetailBox coinId={coinId} />
          <Divider />
          <EpochIndicator coinId={coinId} />
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
                {activeDelegationDetails && activeDelegationDetails.length > 0 ? (
                  activeDelegationDetails.map((item, index) => (
                    <StakingItem
                      key={index}
                      stakingCoinId={coinId}
                      validatorImage={item.validatorImage}
                      validatorName={item.validatorName}
                      validatorAddress={item.validatorAddress}
                      symbol={item.symbol}
                      decimals={item.decimals}
                      stakedAmount={item.stakedAmount}
                      earnedAmount={item.earnedAmount}
                      startEarningEpoch={item.startEarningEpoch}
                      objectId={item.objectId}
                    />
                  ))
                ) : (
                  <EmptyAssetContainer>
                    <EmptyAsset
                      icon={<StakeMachineIcon />}
                      title={t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.startStaking')}
                      subTitle={t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.startStakingDescription')}
                    />

                    <StyledOutlinedChipButton
                      onClick={() => {
                        navigate({
                          to: Stake.to,
                          params: {
                            coinId: coinId,
                            validatorAddress: suiCosmostationValidator?.suiAddress || '',
                          },
                        });
                      }}
                    >
                      <Base1300Text variant="b3_M">{t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.goToStake')}</Base1300Text>
                      <RightArrowIconContainer>
                        <RightArrow />
                      </RightArrowIconContainer>
                    </StyledOutlinedChipButton>
                  </EmptyAssetContainer>
                )}
              </StakingItemContainer>
            </StyledTabPanel>
            <StyledTabPanel value={tabValue} index={1}>
              <StakingItemContainer>
                {pendingDelegationDetails && pendingDelegationDetails.length > 0 ? (
                  pendingDelegationDetails.map((item, index) => (
                    <PendingItem
                      key={index}
                      validatorImage={item.validatorImage}
                      validatorName={item.validatorName}
                      symbol={item.symbol}
                      decimals={item.decimals}
                      stakedAmount={item.stakedAmount}
                      earnedAmount={item.earnedAmount}
                      startEarningEpoch={item.startEarningEpoch}
                      objectId={item.objectId}
                    />
                  ))
                ) : (
                  <EmptyAssetContainer>
                    <EmptyAsset
                      icon={<NoListIcon />}
                      title={t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.emptyPending')}
                      subTitle={t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.emptyPendingDescription')}
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
