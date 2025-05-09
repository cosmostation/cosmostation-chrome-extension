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
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { PERMISSION } from '@/constants/sui';
import { useSiteIconURL } from '@/hooks/common/useSiteIconURL';
import { useCurrentRequestQueue } from '@/hooks/current/useCurrentRequestQueue';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { sendMessage } from '@/libs/extension';
import { getSiteTitle } from '@/utils/website';

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

  const { currentRequestQueue, deQueue } = useCurrentRequestQueue();

  const {
    addApprovedOrigin,
    addSuiPermissions,
    addIotaPermissions,
    currentAccountApporvedOrigins,
    currentAccountApprovedSuiPermissions,
    currentAccountApprovedIotaPermissions,
  } = useCurrentAccount();

  const { siteIconURL } = useSiteIconURL(currentRequestQueue?.origin);
  const siteTitle = getSiteTitle(currentRequestQueue?.origin);

  const currentAccountSuiPermissionTypes = currentAccountApprovedSuiPermissions
    .filter((permission) => permission.origin === currentRequestQueue?.origin)
    .map((permission) => permission.permission);

  const isSuiApporved =
    currentRequestQueue &&
    currentRequestQueue.method === 'sui_connect' &&
    !currentRequestQueue.params.every((permission) => currentAccountSuiPermissionTypes.includes(permission));

  const currentAccountIotaPermissionTypes = currentAccountApprovedIotaPermissions
    .filter((permission) => permission.origin === currentRequestQueue?.origin)
    .map((permission) => permission.permission);

  const isIotaApporved =
    currentRequestQueue &&
    currentRequestQueue.method === 'iota_connect' &&
    !currentRequestQueue.params.every((permission) => currentAccountIotaPermissionTypes.includes(permission));

  if (
    (currentRequestQueue?.origin && !currentAccountApporvedOrigins.map((item) => item.origin).includes(currentRequestQueue.origin)) ||
    isSuiApporved ||
    isIotaApporved
  ) {
    return (
      <Layout>
        <>
          <BaseBody>
            <EdgeAligner>
              <DappInfo image={siteIconURL} name={siteTitle} url={currentRequestQueue.origin} />
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
                {currentRequestQueue.method === 'sui_connect' ? (
                  <CheckListContentsContainer>
                    {currentRequestQueue.params.includes(PERMISSION.VIEW_ACCOUNT) && (
                      <CheckListItemContainer>
                        <SuccessIcon />
                        <Base1300Text variant="b3_R">{t('pages.popup.components.requests.AccessRequest.index.allowAddress')}</Base1300Text>
                      </CheckListItemContainer>
                    )}
                    {currentRequestQueue.params.includes(PERMISSION.SUGGEST_TRANSACTIONS) && (
                      <CheckListItemContainer>
                        <SuccessIcon />
                        <Base1300Text variant="b3_R">{t('pages.popup.components.requests.AccessRequest.index.allowRequestSign')}</Base1300Text>
                      </CheckListItemContainer>
                    )}
                  </CheckListContentsContainer>
                ) : (
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
                )}
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
                  onClick={async () => {
                    sendMessage({
                      target: 'CONTENT',
                      method: 'responseApp',
                      origin: currentRequestQueue.origin,
                      requestId: currentRequestQueue.requestId,
                      tabId: currentRequestQueue.tabId,
                      params: {
                        id: currentRequestQueue.requestId,
                        error: {
                          code: RPC_ERROR.USER_REJECTED_REQUEST,
                          message: `${RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST]}`,
                        },
                      },
                    });

                    await deQueue();
                  }}
                  variant="dark"
                >
                  {t('pages.popup.components.requests.AccessRequest.index.reject')}
                </Button>
              }
              confirmButton={
                <Button
                  onClick={async () => {
                    await addApprovedOrigin(currentRequestQueue.origin);

                    if (currentRequestQueue.method === 'sui_connect') {
                      await addSuiPermissions(currentRequestQueue.params, currentRequestQueue.origin);
                    }

                    if (currentRequestQueue.method === 'iota_connect') {
                      await addIotaPermissions(currentRequestQueue.params, currentRequestQueue.origin);
                    }
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

  return children;
}
