import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { produce } from 'immer';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { useCurrentPreferAccountTypes } from '@/hooks/useCurrentPreferAccountTypes';
import type { Chain } from '@/types/chain';
import { getExtensionLocalStorage } from '@/utils/storage';

import { AccountTypeTextContainer, ChainImage } from './styled';
import CoinTypeBottomSheet from '../CoinTypeBottomSheet';

import DefaultChain from '@/assets/images/chain/defaultChain.png';

type CoinTypeButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  chain: Chain;
  coinTypeLevel: string;
};

export default function CoinTypeButton({ chain, coinTypeLevel, ...remainder }: CoinTypeButtonProps) {
  const { t } = useTranslation();
  const { currentAccount } = useCurrentAccount();
  const { updateCurrentPreferAccountType } = useCurrentPreferAccountTypes();

  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false);

  return (
    <>
      <BaseOptionButton
        key={chain.id}
        onClick={() => {
          setIsOpenBottomSheet(true);
        }}
        leftContent={<ChainImage src={chain.image} defaultImgSrc={DefaultChain} />}
        leftSecondHeader={<Base1300Text variant="b2_M">{chain.name}</Base1300Text>}
        leftSecondBody={
          <AccountTypeTextContainer>
            <Base1000Text variant="b4_R">{t('pages.manage-assets.switch-account-type.entry.selected')}</Base1000Text>
            &nbsp;
            <Base1000Text variant="b3_M">
              {t('pages.manage-assets.switch-account-type.entry.type', {
                accountType: coinTypeLevel,
              })}
            </Base1000Text>
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
        onClickChainType={async (chainId, accountType) => {
          const storedPreferAccountType = await getExtensionLocalStorage('preferAccountType');

          const preferredAccountType = storedPreferAccountType[currentAccount.id];

          const updatedPreferAccountType = produce(preferredAccountType, (draft) => {
            draft[chainId] = accountType;
          });

          await updateCurrentPreferAccountType(updatedPreferAccountType);
        }}
      />
    </>
  );
}
