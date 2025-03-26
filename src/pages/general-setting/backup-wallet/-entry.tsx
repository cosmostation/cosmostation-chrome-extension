import { useState } from 'react';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';

import MnemonicAccountList from './-components/MnemonicAccountList';
import PrivateKeyAccountList from './-components/PrivateKeyAccountList';
import { StickyTabContainer, StyledTabPanel, TabPanelContentsContainer } from './-styled';

export default function Entry() {
  const { currentAccount } = useCurrentAccount();

  const isMnemonicAccount = currentAccount?.type === 'MNEMONIC';

  const [tabIndex, setTabIndex] = useState(isMnemonicAccount ? 0 : 1);
  const tabLabels = ['Mnenmonic', 'Private Key'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabIndex(newTabValue);
  };

  return (
    <BaseBody>
      <EdgeAligner>
        <StickyTabContainer>
          <FilledTabs value={tabIndex} onChange={handleChange} variant="fullWidth">
            {tabLabels.map((item) => (
              <FilledTab key={item} label={item} />
            ))}
          </FilledTabs>
        </StickyTabContainer>
        <StyledTabPanel value={tabIndex} index={0}>
          <TabPanelContentsContainer>
            <MnemonicAccountList />
          </TabPanelContentsContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabIndex} index={1}>
          <TabPanelContentsContainer>
            <PrivateKeyAccountList />
          </TabPanelContentsContainer>
        </StyledTabPanel>
      </EdgeAligner>
    </BaseBody>
  );
}
