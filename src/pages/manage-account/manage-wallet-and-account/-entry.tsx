import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { FilledTab, FilledTabs } from '@/components/common/FilledTab';
import EmptyAsset from '@/components/EmptyAsset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MnemonicAccount from './-components/MnemonicAccount';
import PrivateKeyAccount from './-components/PrivateKeyAccount';
import { EmptyAssetContainer, StickyTabContainer, StyledTabPanel, TabPanelContentsContainer } from './-styled';

import ImportMnemonicIcon from '@/assets/images/icons/ImportMnemonic70.svg';
import ImportPrivateKeyIcon from '@/assets/images/icons/ImportPrivateKey70.svg';

export default function Entry() {
  const { t } = useTranslation();
  const { userAccounts } = useExtensionStorageStore((state) => state);

  const [tabValue, setTabValue] = useState(0);
  const tabLabels = ['Mnenmonic', 'Private Key'];

  const handleChange = (_: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue);
  };

  const uniqueMnemonicRestoreString = userAccounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  const filteredPrivateKeyAccounts = userAccounts.filter((item) => item.type === 'PRIVATE_KEY');

  return (
    <>
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
              {uniqueMnemonicRestoreString.length > 0 ? (
                uniqueMnemonicRestoreString.map((item, i) => <MnemonicAccount key={i} mnemonicRestoreString={item} />)
              ) : (
                <EmptyAssetContainer>
                  <EmptyAsset
                    icon={<ImportMnemonicIcon />}
                    title={t('pages.manage-account.manage-wallet-and-account.entry.importMnemonic')}
                    subTitle={t('pages.manage-account.manage-wallet-and-account.entry.importMnemonicDescription')}
                  />
                </EmptyAssetContainer>
              )}
            </TabPanelContentsContainer>
          </StyledTabPanel>
          <StyledTabPanel value={tabValue} index={1}>
            <TabPanelContentsContainer>
              {filteredPrivateKeyAccounts.length > 0 ? (
                <PrivateKeyAccount />
              ) : (
                <EmptyAssetContainer>
                  <EmptyAsset
                    icon={<ImportPrivateKeyIcon />}
                    title={t('pages.manage-account.manage-wallet-and-account.entry.importPrivateKey')}
                    subTitle={t('pages.manage-account.manage-wallet-and-account.entry.importPrivateKeyDescription')}
                  />
                </EmptyAssetContainer>
              )}
              <PrivateKeyAccount />
            </TabPanelContentsContainer>
          </StyledTabPanel>
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
