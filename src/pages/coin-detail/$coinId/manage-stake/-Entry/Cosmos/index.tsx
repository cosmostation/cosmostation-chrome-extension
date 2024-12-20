import { useState } from 'react';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { Tab, Tabs } from '@/components/common/Tab';
import StakeDetailBox from '@/components/MainBox/StakeDetailBox';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { getCoinId } from '@/utils/queryParamGenerator';

import StakingItem from './components/StakingItem';
import UnstakingItem from './components/UnstakingItem';
import { Container, Divider, StakingItemContainer, StickyTabContainer, StyledTabPanel, TabWrapper } from './styled';

type CosmosProps = {
  coinId: string;
};

export default function Cosmos({ coinId }: CosmosProps) {
  const { data } = useAccountAssets();
  const currentCoin = data?.cosmosAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['My Staking', 'My Unstaking'];

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
                <StakingItem
                  stakingCoinId={coinId}
                  validatorAddress="testValidatorAddress2"
                  validatorImage="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png"
                  validatorName="Cosmostation"
                  commission="5"
                  symbol={currentCoin?.asset.symbol || ''}
                  stakedAmount="100"
                  decimals={currentCoin?.asset.decimals || 0}
                  rewardAmount="40"
                  rewardCounts="3"
                />
              </StakingItemContainer>
            </StyledTabPanel>
            <StyledTabPanel value={tabValue} index={1}>
              <StakingItemContainer>
                <UnstakingItem
                  validatorImage="https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/dydx/moniker/dydxvaloper1hv2jdxyfdkfk4vja52dj0p80mk85nmuaklx55e.png"
                  validatorName="Cosmostation"
                  symbol={currentCoin?.asset.symbol || ''}
                  decimals={currentCoin?.asset.decimals || 0}
                  unstakingAmount="100"
                  unstakingCompletionTime="2024-12-20T01:52:47Z"
                />
              </StakingItemContainer>
            </StyledTabPanel>
          </TabWrapper>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
