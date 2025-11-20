import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import EmptyAsset from '@/components/EmptyAsset';
import Header from '@/components/Header';
import OutlinedChipButton from '@/components/OutlinedChipButton';
import Scaffold from '@/components/Wrapper/components/Scaffold';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { sendMessage } from '@/libs/extension';
import { Route as Home } from '@/pages/index';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';

import ErrorDialog from './-components/ErrorDialog';
import { ContentsContainer, FooterContainer } from './-styled';

import ErrorIcon from '@/assets/images/icons/Error80.svg';

export default function Error({ error }: ErrorComponentProps) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  console.error(error);

  const handleClear = async () => {
    const requestQueue = (await getExtensionLocalStorage('requestQueue')) || [];

    if (requestQueue.length === 0) {
      navigate({ to: Home.to });
      return;
    }

    await Promise.allSettled(
      requestQueue.map((item) =>
        sendMessage({
          target: 'CONTENT',
          method: 'responseApp',
          origin: item.origin,
          requestId: item.requestId,
          tabId: item.tabId,
          params: {
            id: item.requestId,
            error: {
              code: RPC_ERROR.USER_REJECTED_REQUEST,
              message: RPC_ERROR_MESSAGE[RPC_ERROR.USER_REJECTED_REQUEST],
            },
          },
        }),
      ),
    );

    await setExtensionLocalStorage('requestQueue', []);

    navigate({
      to: Home.to,
    });
  };

  return (
    <>
      <Scaffold>
        <BaseLayout header={<Header middleContent={<Base1300Text variant="h4_B">{t('pages.error.index.error')}</Base1300Text>} />}>
          <>
            <BaseBody>
              <ContentsContainer>
                <EmptyAsset icon={<ErrorIcon />} title={t('pages.error.index.errorTitle')} subTitle={t('pages.error.index.errorSubtitle')} />
              </ContentsContainer>
            </BaseBody>
            <BaseFooter>
              <FooterContainer>
                <OutlinedChipButton
                  onClick={() => {
                    setIsOpenDialog(true);
                  }}
                >
                  <Base1300Text variant="b3_M">{t('pages.error.index.errorDialogTitle')}</Base1300Text>
                </OutlinedChipButton>
              </FooterContainer>

              <Button onClick={handleClear}>{t('pages.error.index.backToHome')}</Button>
            </BaseFooter>
          </>
        </BaseLayout>
      </Scaffold>
      <ErrorDialog
        error={error}
        open={isOpenDialog}
        onClose={() => {
          setIsOpenDialog(false);
        }}
        title={t('pages.error.index.errorDialogTitle')}
      />
    </>
  );
}
