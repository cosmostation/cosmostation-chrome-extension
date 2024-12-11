import { useState } from 'react';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MnemonicAccount from './-components/MnemonicAccount';
import PrivateKeyAccount from './-components/PrivateKeyAccount';
import { StickyTabContainer, StyledTabPanel, TabPanelContentsContainer } from './-styled';

export default function Entry() {
  const { accounts } = useExtensionStorageStore((state) => state);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Mnenmonic', 'Private Key'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const uniqueMnemonicRestoreString = accounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <BaseBody>
      <EdgeAligner>
        <StickyTabContainer>
          <FilledTabs value={tabValue} onChange={handleChange} variant="fullWidth">
            {tabLabels.map((item) => (
              <FilledTab key={item} label={item} />
            ))}
          </FilledTabs>
        </StickyTabContainer>
        <StyledTabPanel value={tabValue} index={0}>
          <TabPanelContentsContainer>
            {uniqueMnemonicRestoreString.map((item, i) => (
              <MnemonicAccount key={i} mnemonicRestoreString={item} />
            ))}
          </TabPanelContentsContainer>
        </StyledTabPanel>
        <StyledTabPanel value={tabValue} index={1}>
          <TabPanelContentsContainer>
            <PrivateKeyAccount />
          </TabPanelContentsContainer>
        </StyledTabPanel>
      </EdgeAligner>
    </BaseBody>
  );
}
