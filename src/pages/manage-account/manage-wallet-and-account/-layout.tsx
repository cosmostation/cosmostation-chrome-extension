import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseLayout from '@/components/BaseLayout';
import Base1300Text from '@/components/common/Base1300Text';
import Header from '@/components/Header';
import NavigationPanel from '@/components/Header/components/NavigationPanel';
import { Route as SwitchAccount } from '@/pages/manage-account/switch-account';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';
import { useNewSortedAccountStore } from '@/zustand/hooks/useNewSortedAccountStore';

import { SaveButton } from './-styled';

type LayoutProps = {
  children: JSX.Element;
};

export default function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userAccounts, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { menmonicRestoreStrings: newSortedMnemonicRestoreStrings, privateKeyAccountIds: newSortedPrivateKeyAccountIds } = useNewSortedAccountStore(
    (state) => state,
  );

  const originMnemonicRestoreStrings = userAccounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  const originPrivateKeyAccountIds = userAccounts.filter((item) => item.type === 'PRIVATE_KEY').map((account) => account.id);

  const handleUpdateUserAccounts = useCallback(() => {
    try {
      const isOkToChangeMnemonicOrder = (() => {
        if (newSortedMnemonicRestoreStrings.length === 0) return false;

        const isMnemonicLengthMismatch = originMnemonicRestoreStrings.length !== newSortedMnemonicRestoreStrings.length;
        const isMnemonicRestoreStringEqual =
          new Set(originMnemonicRestoreStrings).size === new Set(newSortedMnemonicRestoreStrings).size &&
          originMnemonicRestoreStrings.every((item) => newSortedMnemonicRestoreStrings.includes(item));

        const isMnemonicValidationFailed = !isMnemonicRestoreStringEqual || isMnemonicLengthMismatch;

        if (isMnemonicValidationFailed) {
          throw new Error('Invalid mnemonic order');
        }

        const isMnemonicChanged =
          newSortedMnemonicRestoreStrings.length > 0 && originMnemonicRestoreStrings.some((item, idx) => item !== newSortedMnemonicRestoreStrings[idx]);

        return isMnemonicChanged;
      })();

      const isOkToChangePrivateKeyOrder = (() => {
        if (newSortedPrivateKeyAccountIds.length === 0) return false;

        const isPrivateKeyLengthMismatch = originPrivateKeyAccountIds.length !== newSortedPrivateKeyAccountIds.length;
        const isPrivateKeyAccountIdsEqual =
          new Set(originPrivateKeyAccountIds).size === new Set(newSortedPrivateKeyAccountIds).size &&
          originPrivateKeyAccountIds.every((item) => newSortedPrivateKeyAccountIds.includes(item));

        const isPrivateKeyValidationFailed = !isPrivateKeyAccountIdsEqual || isPrivateKeyLengthMismatch;

        if (isPrivateKeyValidationFailed) {
          throw new Error('Invalid private key order');
        }

        const isPrivateKeyChanged =
          newSortedPrivateKeyAccountIds.length > 0 && originPrivateKeyAccountIds.some((item, idx) => item !== newSortedPrivateKeyAccountIds[idx]);

        return isPrivateKeyChanged;
      })();

      if (isOkToChangeMnemonicOrder || isOkToChangePrivateKeyOrder) {
        const mnemonicAccounts = userAccounts.filter((acc) => acc.type === 'MNEMONIC');
        const privateKeyAccounts = userAccounts.filter((acc) => acc.type === 'PRIVATE_KEY');

        const sortedMnemonicAccounts = isOkToChangeMnemonicOrder
          ? mnemonicAccounts.sort(
              (a, b) => newSortedMnemonicRestoreStrings.indexOf(a.encryptedRestoreString) - newSortedMnemonicRestoreStrings.indexOf(b.encryptedRestoreString),
            )
          : mnemonicAccounts;

        const sortedPrivateKeyAccounts = isOkToChangePrivateKeyOrder
          ? privateKeyAccounts.sort((a, b) => newSortedPrivateKeyAccountIds.indexOf(a.id) - newSortedPrivateKeyAccountIds.indexOf(b.id))
          : privateKeyAccounts;

        updateExtensionStorageStore('userAccounts', [...sortedMnemonicAccounts, ...sortedPrivateKeyAccounts]);
      }

      toastSuccess(t('pages.manage-account.manage-wallet-and-account.layout.saveSuccess'));
    } catch {
      toastError(t('pages.manage-account.manage-wallet-and-account.layout.saveFail'));
    } finally {
      navigate({
        to: SwitchAccount.to,
      });
    }
  }, [
    originMnemonicRestoreStrings,
    newSortedMnemonicRestoreStrings,
    originPrivateKeyAccountIds,
    newSortedPrivateKeyAccountIds,
    t,
    userAccounts,
    updateExtensionStorageStore,
    navigate,
  ]);

  return (
    <BaseLayout
      header={
        <Header
          leftContent={<NavigationPanel />}
          middleContent={<Base1300Text variant="h4_B">{t('pages.manage-account.manage-wallet-and-account.layout.header')}</Base1300Text>}
          rightContent={
            <SaveButton onClick={handleUpdateUserAccounts} typoVarient="h6n_M">
              {t('pages.manage-account.manage-wallet-and-account.layout.save')}
            </SaveButton>
          }
        />
      }
    >
      {children}
    </BaseLayout>
  );
}
