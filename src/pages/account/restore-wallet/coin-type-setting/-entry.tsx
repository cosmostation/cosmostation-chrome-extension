import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import InformationPanel from '@/components/InformationPanel';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CoinTypeSelector from './-components/CoinTypeSelector';
import { Body, CoinTypeSelectorContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const { setCurrentAccount } = useCurrentAccount();

  // FIXME 카바 토큰이 리스팅되지 않는 이슈?? =>
  // NOTE 내 경우 118 카바의 에셋에서 밸런스가 0이라서 히든에 들어가게 되는데 이때 들어가는 아이템이 459의 아이템과 동일하여 459는 밸런스가 있음에도 불구하고 히든처리가 되는것.
  const setUp = async (newAccountName: string) => {
    try {
      const account = accounts[0];

      const newAccount: AccountWithName = {
        ...account,
        name: newAccountName,
      };

      await setCurrentAccount(newAccount.id);
      // TODO
      // await setExtensionStorage('selectedEthereumNetworkId', ETHEREUM_NETWORKS[0].id);

      await updateExtensionStorageStore('accountNamesById', { [account.id]: newAccountName });
      await updateExtensionStorageStore('mnemonicNamesByHashedMnemonic', {
        [newAccount.encryptedRestoreString]: `Mnemonic 1`,
      });

      navigate({
        to: Dashboard.to,
      });

      toastSuccess(t('pages.account.restore-wallet.coin-type-setting.entry.setupSuccess'));
    } catch {
      toastError(t('pages.account.restore-wallet.coin-type-setting.entry.setupError'));
    }
  };

  return (
    <>
      <BaseBody>
        <Body>
          <InformationPanel
            varitant="info"
            titleText={t('pages.account.restore-wallet.coin-type-setting.entry.infoTitle')}
            bodyText={t('pages.account.restore-wallet.coin-type-setting.entry.infoBody')}
          />
          <CoinTypeSelectorContainer>
            <CoinTypeSelector />
          </CoinTypeSelectorContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            setIsOpenSetAccountNameBottomSheet(true);
          }}
        >
          {t('pages.account.restore-wallet.coin-type-setting.entry.next')}
        </Button>
      </BaseFooter>
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={async (accountName) => {
          await setUp(accountName);
        }}
      />
    </>
  );
}
