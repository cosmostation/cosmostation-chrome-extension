import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import CoinTypeSelector from '@/components/CoinTypeSelector';
import Button from '@/components/common/Button';
import InformationPanel from '@/components/InformationPanel';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useMultipleAccountTypes } from '@/hooks/useMultipleAccountTypes';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import type { ChainAccountType } from '@/types/chain';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, Footer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const accountId = accounts.length > 0 ? accounts[0].id : '';

  const { defaultPreferAccountTypes } = useMultipleAccountTypes({ accountId });
  const { setCurrentAccount } = useCurrentAccount();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [preferAccountTypes, setPreferAccountTypes] = useState(defaultPreferAccountTypes || {});

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
      // TODO  계정 추가되는 모든 과정(새 니모닉 생성, pk로 복원)에 아래 로직을 추가해야함.
      // TODO 단 새로 추가되는 계정에 한해서는 디폴트 값을 자동으로 저장하도록 / 코인 타입 셀렉팅은 첫 게정 생성에서 니모닉 복원 과정에서만 해당함.
      await updateExtensionStorageStore('preferAccountType', {
        [newAccount.id]: preferAccountTypes,
      });

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

  const updateAccountType = (key: string, newAccountType: ChainAccountType) => {
    setPreferAccountTypes((prevAccountTypes) =>
      produce(prevAccountTypes, (draft) => {
        draft[key] = newAccountType;
      }),
    );
  };

  useEffect(() => {
    if (defaultPreferAccountTypes) {
      setPreferAccountTypes(defaultPreferAccountTypes);
    }
  }, [defaultPreferAccountTypes]);
  return (
    <>
      <BaseBody>
        <Body>
          <InformationPanel
            varitant="info"
            titleText={t('pages.account.restore-wallet.coin-type-setting.entry.infoTitle')}
            bodyText={t('pages.account.restore-wallet.coin-type-setting.entry.infoBody')}
          />
          <CoinTypeSelector
            accountId={accountId}
            currentPreferAccountTypes={preferAccountTypes}
            variant="filtered"
            onClickChainType={(id, acc) => {
              updateAccountType(id, acc);
            }}
          />
        </Body>
      </BaseBody>
      <Footer>
        <Button
          onClick={() => {
            setIsOpenSetAccountNameBottomSheet(true);
          }}
        >
          {t('pages.account.restore-wallet.coin-type-setting.entry.next')}
        </Button>
      </Footer>

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
