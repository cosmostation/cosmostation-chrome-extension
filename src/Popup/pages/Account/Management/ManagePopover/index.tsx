import { useState } from 'react';
import type { PopoverProps } from '@mui/material';

import Popover from '~/Popup/components/common/Popover';
import type { Account } from '~/types/chromeStorage';

import ChangeNameDialog from './ChangeNameDialog';
import ExportPrivateKeyDialog from './ExportPrivateKeyDialog';
import ManageButton from './ManageButton';
import { Container, StyledPopover } from './styled';

import Delete16Icon from '~/images/icons/Delete16.svg';
import Edit16Icon from '~/images/icons/Edit16.svg';
import Key16Icon from '~/images/icons/Key16.svg';
import Lock16Icon from '~/images/icons/Lock16.svg';

type ManagePopoverProps = Omit<PopoverProps, 'children'> & { account?: Account };

export default function ManagePopover({ account, onClose, ...remainder }: ManagePopoverProps) {
  const [isOpenedChangeNameDialog, setIsOpenedChangeNameDialog] = useState(false);
  const [isOpenedExportPrivateKeyDialog, setIsOpenedExportPrivateKeyDialog] = useState(false);

  if (!account) {
    return null;
  }

  return (
    <>
      <StyledPopover onClose={onClose} {...remainder}>
        <Container>
          <ManageButton Icon={Edit16Icon} onClick={() => setIsOpenedChangeNameDialog(true)}>
            Rename account
          </ManageButton>
          {account.type === 'MNEMONIC' && <ManageButton Icon={Lock16Icon}>View secret phrase</ManageButton>}
          <ManageButton Icon={Key16Icon} onClick={() => setIsOpenedExportPrivateKeyDialog(true)}>
            Export private key
          </ManageButton>
          <ManageButton Icon={Delete16Icon}>Delete account</ManageButton>
        </Container>
      </StyledPopover>
      <ChangeNameDialog open={isOpenedChangeNameDialog} onClose={() => setIsOpenedChangeNameDialog(false)} account={account} />
      <ExportPrivateKeyDialog open={isOpenedExportPrivateKeyDialog} onClose={() => setIsOpenedExportPrivateKeyDialog(false)} account={account} />
    </>
  );
}
