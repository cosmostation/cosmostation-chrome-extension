import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import { ADDRESS_FORMAT_MAPPING } from '@/constants/bitcoin/common';
import { useChangeCoinAccountType } from '@/hooks/useChangeCoinAccountType';
import type { Chain, ChainAccountType } from '@/types/chain';
import { devLogger } from '@/utils/devLogger';
import { toastError, toastSuccess } from '@/utils/toast';

import { AccountTypeTextContainer, ChainImage } from './styled';
import CoinTypeBottomSheet from '../CoinTypeBottomSheet';

type CoinTypeButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  chain: Chain;
  coinTypeLevel: string;
};

export default function CoinTypeButton({ chain, coinTypeLevel, ...remainder }: CoinTypeButtonProps) {
  const { t } = useTranslation();
  const { changeCoinType } = useChangeCoinAccountType();

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
        await changeCoinType(id, accountType);
        toastSuccess(t('pages.manage-assets.switch-account-type.entry.successSwitch'));
      } catch (error) {
        devLogger.error(`[ChangeAccountType in ChainlistBottomSheet] Error`, error);
        toastError(t('pages.manage-assets.switch-account-type.entry.failSwitch'));
      } finally {
        setIsOpenBottomSheet(false);
      }
    },
    [changeCoinType, t],
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
