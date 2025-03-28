import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Base1300Text from '@/components/common/Base1300Text';
import LinearProgressBar from '@/components/common/LinearProgressBar';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { isMigrationRequired_V1_0_0, migrateData } from '@/utils/storageMigration/v1/migration';
import { toastError } from '@/utils/toast';
import { setLoadingProgressBarStore, useLoadingProgressBarStore } from '@/zustand/hooks/useLoadingProgressBar';

import { Container, ContentsContainer, DescriptionText, ImgContainer, LinearProgressContainer, LoadingProgressText, RetryButton } from './styled';

import cosmostationLogo from '@/assets/images/logos/cosmostation100.png';

type MigrationCheckerProps = {
  children: JSX.Element;
};

export default function MigrationChecker({ children }: MigrationCheckerProps) {
  const { t } = useTranslation();
  const { progressValue } = useLoadingProgressBarStore((state) => state);
  const [isMigrateComplete, setIsMigrateComplete] = useState<boolean | undefined>();
  const [isFailToMigrate, setIsFailToMigrate] = useState(false);

  // TODO 에러 리트라이 3번 이상 실패 시 초기화 옵션 제공.
  const handleRetry = async () => {
    try {
      setIsMigrateComplete(false);
      setIsFailToMigrate(false);

      await migrateData();

      setIsMigrateComplete(true);
    } catch {
      toastError(t('components.Wrapper.components.MigrationChecker.index.migrationError'));

      setLoadingProgressBarStore(0);
      setIsFailToMigrate(true);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const isMigrationRequired = await isMigrationRequired_V1_0_0();

        if (!isMigrationRequired) {
          setIsMigrateComplete(true);
          return;
        }
        setIsMigrateComplete(false);

        await migrateData();

        setIsMigrateComplete(true);
      } catch {
        toastError(t('components.Wrapper.components.MigrationChecker.index.migrationError'));

        setLoadingProgressBarStore(0);
        setIsFailToMigrate(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isMigrateComplete === undefined) {
    return <></>;
  }

  if (!isMigrateComplete) {
    return (
      <BaseLayout
        header={
          <Header
            leftContent={<NavigationPanel isHideBackButton isHideHomeButton />}
            middleContent={<Base1300Text variant="h4_B">{t('components.Wrapper.components.MigrationChecker.index.migration')}</Base1300Text>}
          />
        }
      >
        <BaseBody>
          <Container>
            <ContentsContainer>
              <ImgContainer src={cosmostationLogo} />

              <Base1300Text variant="b1_B">
                {t('components.Wrapper.components.MigrationChecker.index.migrationInProgress')}
                <LoadingText />
              </Base1300Text>

              <DescriptionText variant="b3_M_Multiline">{t('components.Wrapper.components.MigrationChecker.index.migrationDescription')}</DescriptionText>

              <LinearProgressContainer>
                <LinearProgressBar variant="determinate" value={progressValue} />
              </LinearProgressContainer>

              <LoadingProgressText variant="b3_M">
                {t('components.Wrapper.components.MigrationChecker.index.completed', {
                  percent: progressValue,
                })}
              </LoadingProgressText>

              {isFailToMigrate && (
                <RetryButton>
                  <Base1300Text variant="h4_B" onClick={handleRetry}>
                    {t('components.Wrapper.components.MigrationChecker.index.retry')}
                  </Base1300Text>
                </RetryButton>
              )}
            </ContentsContainer>
          </Container>
        </BaseBody>
      </BaseLayout>
    );
  }

  return <>{children}</>;
}

const LoadingText = () => {
  const dotsArray = ['', '.', '..', '...'];
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % dotsArray.length);
    }, 500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <span>{dotsArray[dotIndex]}</span>;
};
