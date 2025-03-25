import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1300Text from '@/components/common/Base1300Text';
import Switch from '@/components/common/Switch';
import InformationPanel from '@/components/InformationPanel';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { ContentsContainer, InformationPanelContainer, ProviderImage, SwitchContainer, SwitchLeftContainer } from './-styled';

import keplrLogoImage from 'assets/images/provider/keplr.png';
import metamaskLogoImage from 'assets/images/provider/metamask.png';

export default function Entry() {
  const { t } = useTranslation();

  const { prioritizedProvider, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  return (
    <>
      <BaseBody>
        <>
          <InformationPanelContainer>
            <InformationPanel
              varitant="info"
              title={<Typography variant="b3_M">{t('pages.general-setting.wallet-prioritize.entry.title')}</Typography>}
              body={<Typography variant="b4_R_Multiline">{t('pages.general-setting.wallet-prioritize.entry.subTitle')}</Typography>}
            />
          </InformationPanelContainer>

          <ContentsContainer>
            <SwitchContainer>
              <SwitchLeftContainer>
                <ProviderImage src={metamaskLogoImage} />
                <Base1300Text variant="b2_B">Metamask Wallet</Base1300Text>
              </SwitchLeftContainer>

              <Switch
                checked={prioritizedProvider.metamask}
                onChange={(_, checked) => {
                  updateExtensionStorageStore('prioritizedProvider', {
                    ...prioritizedProvider,
                    metamask: checked,
                  });
                }}
              />
            </SwitchContainer>
            <SwitchContainer>
              <SwitchLeftContainer>
                <ProviderImage src={keplrLogoImage} />
                <Base1300Text variant="b2_B">Keplr Wallet</Base1300Text>
              </SwitchLeftContainer>

              <Switch
                checked={prioritizedProvider.keplr}
                onChange={(_, checked) => {
                  updateExtensionStorageStore('prioritizedProvider', {
                    ...prioritizedProvider,
                    keplr: checked,
                  });
                }}
              />
            </SwitchContainer>
          </ContentsContainer>
        </>
      </BaseBody>
    </>
  );
}
