import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { Tab, Tabs } from '@/components/common/Tab';
import EmptyAsset from '@/components/EmptyAsset';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import EpochIndicator from './components/EpochIndicator';
import StakingItem from './components/StakingItem';
import { Container, Divider, EmptyAssetContainer, StakingItemContainer, StickyTabContainer, StyledTabPanel, TabWrapper } from './styled';

import ImportPrivateKeyIcon from '@/assets/images/icons/ImportPrivateKey70.svg';

type SuiProps = {
  coinId: string;
};

export default function Sui({ coinId }: SuiProps) {
  const { t } = useTranslation();

  const { data } = useAccountAssets();
  const currentCoin = data?.suiAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['My Active', 'My Pending'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

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
                <StakingItem
                  validatorImage="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png"
                  validatorName="Cosmostation"
                  symbol={currentCoin?.asset.symbol || ''}
                  decimals={currentCoin?.asset.decimals || 0}
                  stakedAmount="100"
                  totalStakedAmount="1000"
                  earnedAmount="900"
                  startEarningEpoch="600"
                  objectId="0x69bed13306e0a48590c695ef8b967177f039394279624faab0f984d03a17acfa"
                />
              </StakingItemContainer>
            </StyledTabPanel>
            <StyledTabPanel value={tabValue} index={1}>
              <StakingItemContainer>
                <EmptyAssetContainer>
                  <EmptyAsset
                    icon={<ImportPrivateKeyIcon />}
                    title={t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.emptyPending')}
                    subTitle={t('pages.coin-detail.$coinId.manage-stake.entry.Sui.index.emptyPendingDescription')}
                  />
                </EmptyAssetContainer>
              </StakingItemContainer>
            </StyledTabPanel>
          </TabWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
