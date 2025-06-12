import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { ADDRESS_FORMAT_MAPPING } from '@/constants/bitcoin/common';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import { useSyncChainFilterIdWithAccountType } from '@/hooks/useSyncChainFilterIdWithAccountType';
import type { Chain, ChainAccountType } from '@/types/chain';
import { devLogger } from '@/utils/devLogger';
import { emitChangedAddressEvent } from '@/utils/event';
import { parseUniqueChainId } from '@/utils/queryParamGenerator';
import { getExtensionLocalStorage } from '@/utils/storage';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountTypeTextContainer, ChainImage } from './styled';
import CoinTypeBottomSheet from '../CoinTypeBottomSheet';

type CoinTypeButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  chain: Chain;
  coinTypeLevel: string;
};

export default function CoinTypeButton({ chain, coinTypeLevel, ...remainder }: CoinTypeButtonProps) {
  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();
  const { updateCurrentPreferAccountType } = useCurrentPreferAccountTypes();
  const { selectedChainFilterId } = useExtensionStorageStore((state) => state);
  const { syncChainFilterIdWithAccountType } = useSyncChainFilterIdWithAccountType();

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  const addressTypeLabel = (() => {
    if (chain.chainType === 'bitcoin') {
      return ADDRESS_FORMAT_MAPPING[coinTypeLevel as keyof typeof ADDRESS_FORMAT_MAPPING];
    }

    return t('pages.manage-assets.switch-account-type.entry.type', {
      accountType: coinTypeLevel,
    });
  })();

  const handleChangeAccountType = useCallback(
    async (id: string, accountType: ChainAccountType) => {
      try {
        const updateSelectedChainFilterId = async () => {
          const currentParsedChainFilterId = selectedChainFilterId && parseUniqueChainId(selectedChainFilterId);
          const isChangeSameChain = id === currentParsedChainFilterId?.id;

          if (isChangeSameChain) {
            await syncChainFilterIdWithAccountType(accountType);
          }
        };

        const updatedPreferAccountTypeFunc = async () => {
          const storedPreferAccountType = (await getExtensionLocalStorage('preferAccountType')) ?? {};

          const preferredAccountType = storedPreferAccountType[currentAccount.id];

          const updatedPreferAccountType = preferredAccountType
            ? produce(preferredAccountType, (draft) => {
                draft[id] = accountType;
              })
            : preferredAccountType;

          if (!updatedPreferAccountType) {
            return;
          }
          await updateCurrentPreferAccountType(updatedPreferAccountType);
        };

        await updatedPreferAccountTypeFunc();
        await updateSelectedChainFilterId();

        await emitChangedAddressEvent(currentAccount.id);

        toastSuccess(t('pages.manage-assets.switch-account-type.entry.successSwitch'));
        setIsOpenBottomSheet(false);
      } catch (error) {
        devLogger.error(`[ChangeAccountType] Error`, error);
      }
    },
    [currentAccount.id, selectedChainFilterId, syncChainFilterIdWithAccountType, t, updateCurrentPreferAccountType],
  );

  return (
    <>
      <BaseOptionButton
        key={chain.id}
        onClick={() => {
          setIsOpenBottomSheet(true);
        }}
        leftContent={<ChainImage src={chain.image} />}
        leftSecondHeader={<Base1300Text variant="b2_M">{chain.name}</Base1300Text>}
        leftSecondBody={
          <AccountTypeTextContainer>
            <Base1000Text variant="b4_R">{t('pages.manage-assets.switch-account-type.entry.selected')}</Base1000Text>
            &nbsp;
            <Base1000Text variant="b3_M">{addressTypeLabel}</Base1000Text>
          </AccountTypeTextContainer>
        }
        {...remainder}
      />
      <CoinTypeBottomSheet
        open={isOpenBottomSheet}
        onClose={() => {
          setIsOpenBottomSheet(false);
        }}
        chain={chain}
        onClickChainType={handleChangeAccountType}
      />
    </>
  );
}
