import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { Tab, Tabs } from '@/components/common/Tab';

import SupportedAssets from './-components/SupportedAssets';
import { Container, StickyTabContainer, StyledTabPanel } from './-styled';

export default function Entry() {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(0);

  const tabLabels = [t('pages.manage-assets.visibility.assets.entry.supportedCrypto'), t('pages.manage-assets.visibility.assets.entry.customCrypto')];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  return (
    <BaseBody>
      <EdgeAligner>
        <Container>
          <StickyTabContainer>
            <Tabs value={tabValue} onChange={handleChange} variant="fullWidth">
              {tabLabels.map((item) => (
                <Tab key={item} label={item} />
              ))}
            </Tabs>
          </StickyTabContainer>
          <StyledTabPanel value={tabValue} index={0}>
            <SupportedAssets />
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <>fds</>
            {/* <StickyTabPanelContentsContainer>
              <FilterContaienr>
                <StyledInput
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  }
                  placeholder={'Search'}
                  value={customAssetsSearch}
                  onChange={(event) => {
                    setCustomAssetsSearch(event.currentTarget.value);
                  }}
                />
              </FilterContaienr>
              <RowContainer>
                <AllNetworkButton
                  sizeVariant="medium"
                  typoVarient="b2_M"
                  currentChainId={currentSelectedChainId}
                  chainList={flatChainList}
                  isManageAssets
                  selectChainOption={(id) => {
                    setCurrentSelectedChainId(id);
                  }}
                />
                <IconTextButton>
                  <IconTextButton
                    leadingIcon={
                      <PurpleContainer>
                        <PlusIcon />
                      </PurpleContainer>
                    }
                  >
                    <ImportTextContainer>
                      <Typography variant="b3_M">{t('pages.manage-assets.visibility.assets.entry.importCrypto')}</Typography>
                    </ImportTextContainer>
                  </IconTextButton>
                </IconTextButton>
              </RowContainer>
            </StickyTabPanelContentsContainer> */}
          </StyledTabPanel>
        </Container>
      </EdgeAligner>
    </BaseBody>
  );
}
