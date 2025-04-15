import { useTranslation } from 'react-i18next';
import { type PopoverProps } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import type { MnemonicBits } from '@/pages/account/create-wallet/mnemonic/-entry';

import { StyledIconTextButton, StyledPopover } from './styled';

type MnemonicBitsPopoverProps = Omit<PopoverProps, 'children'> & {
  onClickMnemonicBits: (bits: MnemonicBits) => void;
};

export default function MnemonicBitsPopover({ onClose, onClickMnemonicBits, ...remainder }: MnemonicBitsPopoverProps) {
  const { t } = useTranslation();

  return (
    <StyledPopover {...remainder} onClose={onClose}>
      <StyledIconTextButton
        onClick={() => {
          onClickMnemonicBits(128);
          onClose?.({}, 'backdropClick');
        }}
      >
        <Base1300Text variant="b3_M">{t('pages.account.create-mnemonic.mnemonic.components.MnemonicBitPopover.index.twelveWords')}</Base1300Text>
      </StyledIconTextButton>
      <StyledIconTextButton
        onClick={() => {
          onClickMnemonicBits(192);
          onClose?.({}, 'backdropClick');
        }}
      >
        <Base1300Text variant="b3_M">{t('pages.account.create-mnemonic.mnemonic.components.MnemonicBitPopover.index.eighteenWords')}</Base1300Text>
      </StyledIconTextButton>
      <StyledIconTextButton
        onClick={() => {
          onClickMnemonicBits(256);
          onClose?.({}, 'backdropClick');
        }}
      >
        <Base1300Text variant="b3_M">{t('pages.account.create-mnemonic.mnemonic.components.MnemonicBitPopover.index.twentyWords')}</Base1300Text>
      </StyledIconTextButton>
    </StyledPopover>
  );
}
