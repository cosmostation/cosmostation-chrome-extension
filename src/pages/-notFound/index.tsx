import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import TextButton from '@/components/common/TextButton';
import EmptyAsset from '@/components/EmptyAsset';
import Header from '@/components/Header';
import { RPC_ERROR, RPC_ERROR_MESSAGE } from '@/constants/error';
import { sendMessage } from '@/libs/extension';
import { Route as Home } from '@/pages/index';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { ContentsContainer, FooterContainer } from './-styled';

import ErrorIcon from '@/assets/images/icons/Error80.svg';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { requestQueue, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const handleClear = async () => {
    if (requestQueue.length === 0) {
      navigate({ to: Home.to });
      return;
    }

    await Promise.all(
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

    await updateExtensionStorageStore('requestQueue', []);

    navigate({
      to: Home.to,
    });
  };

  return (
    <BaseLayout header={<Header middleContent={<Base1300Text variant="h4_B">{t('pages.notFound.index.notFound')}</Base1300Text>} />}>
      <>
        <BaseBody>
          <ContentsContainer>
            <EmptyAsset icon={<ErrorIcon />} title={t('pages.notFound.index.pageNotFound')} subTitle={t('pages.notFound.index.pageNotFoundSubtitle')} />
          </ContentsContainer>
        </BaseBody>
        <BaseFooter>
          <FooterContainer
            style={{
              visibility: 'hidden',
            }}
          >
            <Base1300Text variant="b3_R">{t('pages.notFound.index.feedback')}</Base1300Text>
            <TextButton variant="hyperlink" typoVarient="b2_M">
              {t('pages.notFound.index.sendReportEmail')}
            </TextButton>
          </FooterContainer>

          <Button onClick={handleClear}>{t('pages.notFound.index.backToHome')}</Button>
        </BaseFooter>
      </>
    </BaseLayout>
  );
}
