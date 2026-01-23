import { useCallback, useState } from 'react';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import CheckLegacyAddressBalanceBottomSheet from '@/components/CheckLegacyAddressBalanceBottomSheet';
import { Tab, Tabs } from '@/components/common/Tab';
import PortFolio from '@/components/MainBox/Portfolio';
import { useCurrentAccountAddedNFTsWithMetaData } from '@/hooks/useCurrentAccountAddedNFTsWithMetaData';
import type { FlatAccountAssets } from '@/types/accountAssets';

import CryptoTab from './-components/CryptoTab';
import NFTList from './-components/NFTList';
import { Container, StickyTabContainer, StyledTabPanel } from './-styled';

export type PortfolioCoinItem = FlatAccountAssets & {
  value: string;
  dollarValue: string;
  totalDisplayAmount: string;
  counts: string;
};

const TAB_LABELS = ['Crypto', 'NFTs'] as const;

export default function Entry() {
  const [tabValue, setTabValue] = useState(0);

  useCurrentAccountAddedNFTsWithMetaData();

  const handleTabChange = useCallback((_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  }, []);

  return (
    <>
      <BaseBody>
        <EdgeAligner
          style={{
            flex: '1',
          }}
        >
          <Container>
            <PortFolio />

            <StickyTabContainer>
              <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                {TAB_LABELS.map((item) => (
                  <Tab key={item} label={item} />
                ))}
              </Tabs>
            </StickyTabContainer>

            <StyledTabPanel value={tabValue} index={0} data-is-active={tabValue === 0}>
              <CryptoTab />
            </StyledTabPanel>

            <StyledTabPanel value={tabValue} index={1} data-is-active={tabValue === 1}>
              <NFTList />
            </StyledTabPanel>
          </Container>
        </EdgeAligner>
      </BaseBody>
      <CheckLegacyAddressBalanceBottomSheet />
    </>
  );
}
