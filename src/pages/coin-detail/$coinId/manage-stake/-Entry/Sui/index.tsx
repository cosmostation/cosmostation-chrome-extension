import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1300Text from '@/components/common/Base1300Text';
import { Tab, Tabs } from '@/components/common/Tab';
import EmptyAsset from '@/components/EmptyAsset';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { Route as Stake } from '@/pages/wallet/stake/$coinId/$validatorAddress';
import { getCoinId } from '@/utils/queryParamGenerator';

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

  const { data } = useAccountAssets();
  const currentCoin = data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['My Active', 'My Pending'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const dummyPendingItems = [
    {
      validatorName: 'Cosmostation',
      objectId: '0x69bed13306e0a48590c695ef8b967177f039394279624faab0f984d03a17acfa',
      symbol: 'SUI',
      decimals: currentCoin?.asset.decimals || 0,
      totalStakedAmount: '1000',
      stakedAmount: '100',
      earnedAmount: '900',
      startEarningEpoch: '600',
      validatorImage: 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png',
    },
  ];

  const dummyStakingItems = [
    {
      validatorName: 'Cosmostation',
      objectId: '0x69bed13306e0a48590c695ef8b967177f039394279624faab0f984d03a17acfa',
      symbol: 'SUI',
      decimals: currentCoin?.asset.decimals || 0,
      totalStakedAmount: '1000',
      stakedAmount: '100',
      earnedAmount: '900',
      startEarningEpoch: '600',
      validatorImage: 'https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png',
    },
  ];

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StakeDetailBox coinId={coinId} />
          <Divider />
          <EpochIndicator />
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
                {dummyStakingItems.length > 0 ? (
                  dummyStakingItems.map((item, index) => (
                    <StakingItem
                      key={index}
                      validatorImage={item.validatorImage}
                      validatorName={item.validatorName}
                      symbol={item.symbol}
                      decimals={item.decimals}
                      stakedAmount={item.stakedAmount}
                      totalStakedAmount={item.totalStakedAmount}
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
                            // TODO 코스모스테이션 주소 추가
                            validatorAddress: '0x69bed13306e0a48590c695ef8b967177f039394279624faab0f984d03a17acfa',
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
                {dummyPendingItems.length > 0 ? (
                  dummyPendingItems.map((item, index) => (
                    <PendingItem
                      key={index}
                      validatorImage={item.validatorImage}
                      validatorName={item.validatorName}
                      symbol={item.symbol}
                      decimals={item.decimals}
                      stakedAmount={item.stakedAmount}
                      totalStakedAmount={item.totalStakedAmount}
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
