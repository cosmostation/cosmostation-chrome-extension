import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import Button from '@/components/common/Button';
import InformationPanel from '@/components/InformationPanel';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useChainList } from '@/hooks/useChainList';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useMultipleAccountTypes } from '@/hooks/useMultipleAccountTypes';
import { Route as Dashboard } from '@/pages/index';
import type { AccountWithName } from '@/types/account';
import { toastError, toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import CoinTypeSelector from './-components/CoinTypeSelector';
import { Body, CoinTypeSelectorContainer, Footer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, updateExtensionStorageStore } = useExtensionStorageStore((state) => state);
  const { setCurrentAccount } = useCurrentAccount();
  const { currentAccountAssets } = useAccountAssets();
  const { multipleAccountTypeWithAddress, defaultPreferAccountTypes } = useMultipleAccountTypes();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  console.log('🚀 ~ Entry ~ defaultPreferAccountTypes:', defaultPreferAccountTypes);
  console.log('🚀 ~ Entry ~ data:', multipleAccountTypeWithAddress);

  const { flatChainList } = useChainList();

  // TODO
  // const [preferAccountTypes, preferAccountTypes] = useState(second)

  const mappedMultipleAccountTypes = useMemo(() => {
    if (multipleAccountTypeWithAddress && flatChainList) {
      const multipleAccountTypes = Object.values(multipleAccountTypeWithAddress);
      const mappedAccountTypes = multipleAccountTypes.map((item) => {
        const chain = flatChainList.find((chain) => chain.id === item[0].chainId && chain.chainType === item[0].chainType);

        return {
          chain,
          accountTypes: item.map((i) => ({
            accountType: i.accountType,
            address: i.address,
          })),
        };
      });
      return mappedAccountTypes;
    }
    return [];
  }, [multipleAccountTypeWithAddress, flatChainList]);

  console.log('🚀 ~ Entry ~ currentAccountAssets:', currentAccountAssets);
  // TODO 에셋이 있는 체인만 어카운트 타입 선택할 수 있도록, 그 외 디폴트 어카운트 타입 선택하게끔.

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
      // await updateExtensionStorageStore( 'preferAccountType', {
      //   [newAccount.id]: {

      //   },
      // });

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
            {mappedMultipleAccountTypes.map((item, i) => (
              <CoinTypeSelector
                key={i}
                chain={item.chain}
                // TODO 지금은 여기에 선언하지만 useState로 올려야함.
                selectedAccountType={defaultPreferAccountTypes?.[item.chain?.id || '']}
                accountTypeDetails={item.accountTypes}
              />
            ))}
          </CoinTypeSelectorContainer>
        </Body>
      </BaseBody>
      {/* TODO 스타일 수정 필요. */}
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
