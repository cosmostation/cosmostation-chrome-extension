import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import SplitButtonsLayout from '@/components/common/SplitButtonsLayout';
import InformationPanel from '@/components/InformationPanel';

import Layout from './layout';
import {
  CheckListContainer,
  CheckListContentsContainer,
  CheckListItemContainer,
  CheckListTitleContainer,
  Divider,
  DividerContainer,
  InformationContainer,
  LineDivider,
} from './styled';
import DappInfo from '../../DappInfo';
import NetworkInfo from '../../NetworkInfo';
import RequestMethodTitle from '../../RequestMethodTitle';

import SuccessIcon from '@/assets/images/icons/Success18.svg';

type AccessRequestProps = {
  children: JSX.Element;
};

export default function AccessRequest({ children }: AccessRequestProps) {
  const { t } = useTranslation();
  console.log('🚀 ~ AccessRequest ~ children:', children);

  return (
    <Layout>
      <>
        <BaseBody>
          <EdgeAligner>
            <DappInfo image="https://osmosis.zone/favicon.ico" name="Osmosis.zone" url="https://osmosis.zone" />
            <Divider />
            <NetworkInfo />
            <LineDivider />
            <RequestMethodTitle title="Access Request" />
            <DividerContainer>
              <Divider />
            </DividerContainer>
            <CheckListContainer>
              <CheckListTitleContainer>
                <Base1000Text variant="b3_R">{t('pages.popup.components.requests.AccessRequest.index.allowOption')}</Base1000Text>
              </CheckListTitleContainer>
              <CheckListContentsContainer>
                <CheckListItemContainer>
                  <SuccessIcon />
                  <Base1300Text variant="b3_R">{t('pages.popup.components.requests.AccessRequest.index.allowAddress')}</Base1300Text>
                </CheckListItemContainer>
                <CheckListItemContainer>
                  <SuccessIcon />
                  <Base1300Text variant="b3_R">{t('pages.popup.components.requests.AccessRequest.index.allowRequestSign')}</Base1300Text>
                </CheckListItemContainer>
                <CheckListItemContainer>
                  <SuccessIcon />
                  <Base1300Text variant="b3_R">{t('pages.popup.components.requests.AccessRequest.index.encryptMessage')}</Base1300Text>
                </CheckListItemContainer>
              </CheckListContentsContainer>
            </CheckListContainer>
          </EdgeAligner>
        </BaseBody>
        <BaseFooter>
          <InformationContainer>
            <InformationPanel
              varitant="info"
              title={<Typography variant="b3_M">{t('pages.popup.components.requests.AccessRequest.index.informTitle')}</Typography>}
              body={<Typography variant="b4_R_Multiline">{t('pages.popup.components.requests.AccessRequest.index.informDescription')}</Typography>}
            />
          </InformationContainer>
          <SplitButtonsLayout
            cancelButton={
              <Button
                onClick={() => {
                  console.log('🚀 ~ Entry ~ cancelButton ~ onClick');
                }}
                variant="dark"
              >
                {t('pages.popup.components.requests.AccessRequest.index.reject')}
              </Button>
            }
            confirmButton={
              <Button
                onClick={() => {
                  console.log('🚀 ~ Entry ~ confirmButton ~ onClick');
                }}
              >
                {t('pages.popup.components.requests.AccessRequest.index.access')}
              </Button>
            }
          />
        </BaseFooter>
      </>
    </Layout>
  );
}
