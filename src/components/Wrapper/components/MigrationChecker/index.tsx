import { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseLayout from '@/components/BaseLayout';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Base1300Text from '@/components/common/Base1300Text';
import Button from '@/components/common/Button';
import LinearProgressBar from '@/components/common/LinearProgressBar';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import OutlinedChipButton from '@/components/OutlinedChipButton';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { sendMessage } from '@/libs/extension';
import { extension } from '@/utils/browser';
import { getExtensionLocalStorage, setExtensionLocalStorage } from '@/utils/storage';
import { isMigrationRequired_V1_0_0, migrateData, skipMigration } from '@/utils/storageMigration/v1/migration';
import { toastError } from '@/utils/toast';
import { useLoadingOverlayStore } from '@/zustand/hooks/useLoadingOverlayStore';
import { setLoadingProgressBarStore, useLoadingProgressBarStore } from '@/zustand/hooks/useLoadingProgressBar';

import {
  Container,
  ContentsContainer,
  DescriptionText,
  ErrorContainer,
  ErrorText,
  ErrorTextButton,
  ErrorTopContainer,
  ImgContainer,
  LinearProgressContainer,
  LoadingProgressText,
  RightArrowIconContainer,
} from './styled';

import RightArrow from '@/assets/images/icons/RightArrow14.svg';

import cosmostationLogo from '@/assets/images/logos/cosmostation100.png';

type MigrationCheckerProps = {
  children: JSX.Element;
};

export default function MigrationChecker({ children }: MigrationCheckerProps) {
  const { t } = useTranslation();
  const { progressValue } = useLoadingProgressBarStore((state) => state);

  const { setCurrentPassword } = useCurrentPassword();
  const { startLoadingOverlay, stopLoadingOverlay } = useLoadingOverlayStore((state) => state);

  const { refetch: refetchAccountAssets } = useAccountAllAssets();

  const [isOpenVerifyBottomSheet, setIsOpenVerifyBottomSheet] = useState(false);
  const [encryptedPassword, setEncryptedPassword] = useState<string | undefined>();

  const [isMigrateComplete, setIsMigrateComplete] = useState<boolean | undefined>();
  const [isFailToMigrate, setIsFailToMigrate] = useState(false);
  const [isStartedFirstMigration, setIsStartedFirstMigration] = useState(false);

  const handleSkipMigration = async () => {
    try {
      await skipMigration();

      await setExtensionLocalStorage('migrationStatus', {
        '1.0.0': true,
      });

      setIsMigrateComplete(true);
    } catch {
      toastError(t('components.Wrapper.components.MigrationChecker.index.migrationError'));
    }
  };

  const startMigration = async () => {
    try {
      setIsStartedFirstMigration(true);
      setIsMigrateComplete(false);
      setIsFailToMigrate(false);

      setLoadingProgressBarStore(0);

      await migrateData();

      startLoadingOverlay(
        t('pages.account.restore-wallet.mnemonic.index.loadingOverlayTitle'),
        t('pages.account.restore-wallet.mnemonic.index.loadingOverlayMessage'),
      );

      const accounts = await getExtensionLocalStorage('userAccounts');
      const currentAccountId = await getExtensionLocalStorage('currentAccountId');

      const currentAccount = accounts.find((account) => account.id === currentAccountId);
      const accountId = currentAccount ? currentAccount.id : accounts[0]?.id;

      setLoadingProgressBarStore(85);

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateAddress', params: [accountId] });
      setLoadingProgressBarStore(90);

      await sendMessage({ target: 'SERVICE_WORKER', method: 'updateDefaultBalance', params: [accountId] });
      setLoadingProgressBarStore(100);

      await refetchAccountAssets();

      await setExtensionLocalStorage('migrationStatus', {
        '1.0.0': true,
      });

      setIsMigrateComplete(true);
    } catch {
      toastError(t('components.Wrapper.components.MigrationChecker.index.migrationError'));

      setIsFailToMigrate(true);
    } finally {
      stopLoadingOverlay();
    }
  };

  useEffect(() => {
    const checkMigrationStatus = async () => {
      const isMigrationRequired = await isMigrationRequired_V1_0_0();

      if (!isMigrationRequired) {
        setIsMigrateComplete(true);
        return;
      }

      setIsMigrateComplete(false);

      const { encryptedPassword } = await extension.storage.local.get('encryptedPassword');
      setEncryptedPassword(encryptedPassword);
    };

    void checkMigrationStatus();
  }, []);

  if (isMigrateComplete === undefined) {
    return null;
  }

  if (!isMigrateComplete) {
    return (
      <>
        <BaseLayout
          header={
            <Header
              leftContent={<NavigationPanel isHideBackButton isHideHomeButton />}
              middleContent={<Base1300Text variant="h4_B">{t('components.Wrapper.components.MigrationChecker.index.migration')}</Base1300Text>}
            />
          }
        >
          <>
            <BaseBody>
              <Container>
                <ContentsContainer>
                  <ImgContainer src={cosmostationLogo} />

                  <Base1300Text variant="b1_B">
                    {isStartedFirstMigration
                      ? t('components.Wrapper.components.MigrationChecker.index.migrationInProgress')
                      : t('components.Wrapper.components.MigrationChecker.index.migrationRequired')}
                    {isStartedFirstMigration && <LoadingText />}
                  </Base1300Text>

                  <DescriptionText variant="b3_M_Multiline">
                    {isStartedFirstMigration
                      ? t('components.Wrapper.components.MigrationChecker.index.migrationDescription')
                      : t('components.Wrapper.components.MigrationChecker.index.migrationRequiredDescription')}
                  </DescriptionText>

                  {isStartedFirstMigration && (
                    <LinearProgressContainer>
                      <LinearProgressBar variant="determinate" value={progressValue} />
                    </LinearProgressContainer>
                  )}

                  {isStartedFirstMigration ? (
                    isFailToMigrate ? (
                      <ErrorContainer>
                        <ErrorTopContainer>
                          <ErrorText variant="b3_M">{t('components.Wrapper.components.MigrationChecker.index.errorOccurred')}</ErrorText>
                          <ErrorTextButton onClick={startMigration} variant="underline" typoVarient="b3_M">
                            {t('components.Wrapper.components.MigrationChecker.index.retry')}
                          </ErrorTextButton>
                        </ErrorTopContainer>

                        <OutlinedChipButton onClick={handleSkipMigration}>
                          <Base1300Text variant="b3_M">{t('components.Wrapper.components.MigrationChecker.index.skipMigration')}</Base1300Text>
                          <RightArrowIconContainer>
                            <RightArrow />
                          </RightArrowIconContainer>
                        </OutlinedChipButton>
                      </ErrorContainer>
                    ) : (
                      <LoadingProgressText variant="b3_M">
                        {t('components.Wrapper.components.MigrationChecker.index.completed', {
                          percent: progressValue,
                        })}
                      </LoadingProgressText>
                    )
                  ) : null}
                </ContentsContainer>
              </Container>
            </BaseBody>
            <BaseFooter>
              {!isStartedFirstMigration && (
                <Button
                  disabled={!encryptedPassword}
                  onClick={() => {
                    setIsOpenVerifyBottomSheet(true);
                  }}
                >
                  {t('components.Wrapper.components.MigrationChecker.index.startWithMigration')}
                </Button>
              )}
            </BaseFooter>
          </>
        </BaseLayout>
        <VerifyPasswordBottomSheet
          open={isOpenVerifyBottomSheet}
          encryptedPassword={encryptedPassword}
          description={t('components.Wrapper.components.MigrationChecker.index.verifyPasswordBottomSheetDescription')}
          onClose={() => setIsOpenVerifyBottomSheet(false)}
          onSubmit={async (inputPassword) => {
            if (inputPassword) {
              await setCurrentPassword(inputPassword as string);
              await startMigration();
            }
          }}
        />
      </>
    );
  }

  return <>{children}</>;
}

const LoadingText = () => {
  const dotsArray = ['', '.', '..', '...'];

  const [dotIndex, nextDot] = useReducer((prev) => (prev + 1) % dotsArray.length, 0);

  useEffect(() => {
    const interval = setInterval(nextDot, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{dotsArray[dotIndex]}</span>;
};
